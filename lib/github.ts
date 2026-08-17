// ============================================================
// lib/github.ts — GitHub REST API wrapper (browser-safe)
// ============================================================

import { Note, NoteIndexEntry, Folder, NotesIndex, Attachment } from '@/types'

const GITHUB_API_BASE = 'https://api.github.com'
export const REPO_NAME = 'noteflow-data'
export const PUBLIC_REPO_NAME = 'noteflow-public'

// ── UTF-8 safe base64 helpers ────────────────────────────────
// GitHub's Contents API returns/accepts file bodies as base64, and those
// bytes are UTF-8 (Hindi/Devanagari notes are multi-byte in UTF-8). Plain
// atob()/btoa() only map bytes 1:1 to JS UTF-16 code units — they do NOT
// re-assemble multi-byte UTF-8 sequences. Using atob() alone on a Hindi
// note's content silently corrupts it into mojibake (e.g. "à¤à¤¾à¤µà¤¾...").
// These two helpers correctly round-trip any Unicode content and must be
// used everywhere GitHub file content is decoded/encoded (browser + server,
// both support atob/btoa and TextEncoder/TextDecoder).
export function decodeBase64Utf8(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ''))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

export function encodeUtf8Base64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  bytes.forEach((b) => { binary += String.fromCharCode(b) })
  return btoa(binary)
}

// ── Core fetch wrapper ───────────────────────────────────────
export async function githubFetch(
  path: string,
  token: string,
  options: RequestInit = {}
) {
  let res: Response;
  try {
    res = await fetch(`${GITHUB_API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(options.headers ?? {}),
      },
    })
  } catch (err: any) {
    console.warn(`[githubFetch] Network error for ${path}:`, err.message);
    throw new Error('NETWORK_OFFLINE');
  }

  if (!res.ok) {
    if (res.status === 404) return null
    const err = await res.json().catch(() => ({}))
    const e = new Error(err.message ?? `GitHub API error ${res.status}`) as Error & { status?: number }
    e.status = res.status
    throw e
  }

  if (res.status === 204) return true
  return res.json()
}

// ── Ensure private repo exists ───────────────────────────────
export async function getOrCreateRepo(token: string, username: string) {
  const repo = await githubFetch(`/repos/${username}/${REPO_NAME}`, token)
  if (repo) return repo

  return githubFetch('/user/repos', token, {
    method: 'POST',
    body: JSON.stringify({
      name: REPO_NAME,
      private: true,
      description: 'Your notes data — managed by Noteflow',
      auto_init: true,
    }),
  })
}

// ── Ensure public repo exists ───────────────────────────────
export async function getOrCreatePublicRepo(token: string, username: string) {
  const repo = await githubFetch(`/repos/${username}/${PUBLIC_REPO_NAME}`, token)
  if (repo) return repo

  return githubFetch('/user/repos', token, {
    method: 'POST',
    body: JSON.stringify({
      name: PUBLIC_REPO_NAME,
      private: false,
      description: 'Public notes published via Noteflow',
      auto_init: true,
    }),
  })
}

// ── Read a file from the repo ────────────────────────────────
export async function getFile(
  token: string,
  username: string,
  path: string,
  repoName: string = REPO_NAME
): Promise<{ content: any; sha: string } | null> {
  const data = await githubFetch(
    `/repos/${username}/${repoName}/contents/${path}`,
    token
  )
  if (!data?.content) return null

  // Decode base64 → JSON, UTF-8 safe (so Hindi/Devanagari notes survive)
  const raw = decodeBase64Utf8(data.content)
  return {
    content: JSON.parse(raw),
    sha: data.sha,
  }
}

// ── Write a file to the repo ─────────────────────────────────
export async function saveFile(
  token: string,
  username: string,
  path: string,
  content: any,
  sha?: string,
  repoName: string = REPO_NAME
) {
  // Encode JSON → base64, UTF-8 safe
  const json = JSON.stringify(content, null, 2)
  const b64 = encodeUtf8Base64(json)

  const body: Record<string, any> = {
    message: `Update ${path}`,
    content: b64,
  }
  if (sha) body.sha = sha

  return githubFetch(
    `/repos/${username}/${repoName}/contents/${path}`,
    token,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    }
  )
}

// ── List files in a repo directory (used for self-healing) ──
export async function listDir(
  token: string,
  username: string,
  path: string,
  repoName: string = REPO_NAME
): Promise<{ name: string; path: string }[]> {
  const data = await githubFetch(
    `/repos/${username}/${repoName}/contents/${path}`,
    token
  ).catch(() => null)
  if (!Array.isArray(data)) return []
  return data
    .filter((f: any) => f.type === 'file')
    .map((f: any) => ({ name: f.name, path: f.path }))
}

// ── Get commit history for a single file ─────────────────────
export async function getFileHistory(
  token: string,
  username: string,
  path: string,
  perPage = 20
): Promise<any[]> {
  const data = await githubFetch(
    `/repos/${username}/${REPO_NAME}/commits?path=${encodeURIComponent(path)}&per_page=${perPage}`,
    token
  )
  return Array.isArray(data) ? data : []
}

// ── Bootstrap: create repo + index.json if first time ────────
// Also self-heals index.json: if index.json write ever raced/failed
// (e.g. two saves close together, offline retry, 409 conflict) a note
// file can end up sitting in notes/*.json without an entry in the
// index — invisible on the dashboard even though it's really in the
// repo. On every login we cross-check the actual notes/ folder
// against the index and repair any gaps, so nothing is ever silently
// lost from view.
export async function initializeNoteflow(
  token: string,
  username: string
): Promise<NotesIndex> {
  await getOrCreateRepo(token, username)

  const indexFile = await getFile(token, username, 'index.json')
  let index: NotesIndex
  let indexSha: string | undefined

  if (indexFile) {
    index = indexFile.content as NotesIndex
    indexSha = indexFile.sha
  } else {
    index = {
      version: '1.0',
      notes: [],
      folders: [
        { id: 'personal', name: 'Personal', color: '#7F77DD' },
        { id: 'work',     name: 'Work',     color: '#1D9E75' },
      ],
      tags: [],
      updatedAt: new Date().toISOString(),
    }
  }

  const healed = await reconcileIndex(token, username, index)
  if (healed.changed) {
    const saved = await saveFile(token, username, 'index.json', healed.index, indexSha).catch(() => null)
    if (saved?.content?.sha) indexSha = saved.content.sha
    return healed.index
  }

  if (!indexFile) {
    await saveFile(token, username, 'index.json', index)
  }
  return index
}

// ── Reconcile index.notes against the real files on disk ─────
async function reconcileIndex(
  token: string,
  username: string,
  index: NotesIndex
): Promise<{ index: NotesIndex; changed: boolean }> {
  const files = await listDir(token, username, 'notes')
  const knownIds = new Set(index.notes.map((n) => n.id))
  const onDiskIds = files
    .map((f) => f.name.match(/^note-(.+)\.json$/)?.[1])
    .filter((id): id is string => !!id)

  const missingIds = onDiskIds.filter((id) => !knownIds.has(id))
  if (missingIds.length === 0) {
    return { index, changed: false }
  }

  const recovered = await Promise.all(
    missingIds.map((id) => getFile(token, username, `notes/note-${id}.json`))
  )

  const newEntries = recovered
    .filter((f): f is { content: any; sha: string } => !!f?.content)
    .map((f) => {
      const note = f.content
      return {
        id: note.id,
        title: note.title ?? 'Untitled Note',
        contentPreview: note.contentText?.slice(0, 200) ?? '',
        tags: note.tags ?? [],
        folder: note.folder ?? '',
        isPinned: note.isPinned ?? false,
        isFavorite: note.isFavorite ?? false,
        color: note.color,
        createdAt: note.createdAt ?? new Date().toISOString(),
        updatedAt: note.updatedAt ?? new Date().toISOString(),
        isPublished: note.isPublished ?? false,
        slug: note.slug ?? '',
        publishedAt: note.publishedAt,
      }
    })

  if (newEntries.length === 0) {
    return { index, changed: false }
  }

  const repaired: NotesIndex = {
    ...index,
    notes: [...index.notes, ...newEntries],
    updatedAt: new Date().toISOString(),
  }
  return { index: repaired, changed: true }
}
