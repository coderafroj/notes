// ============================================================
// lib/github.ts — GitHub REST API wrapper (browser-safe)
// ============================================================

import { Note, NoteIndexEntry, Folder, NotesIndex, Attachment } from '@/types'

const GITHUB_API_BASE = 'https://api.github.com'
export const REPO_NAME = 'noteflow-data'

// ── Core fetch wrapper ───────────────────────────────────────
export async function githubFetch(
  path: string,
  token: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${GITHUB_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    if (res.status === 404) return null
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? `GitHub API error ${res.status}`)
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

// ── Read a file from the repo ────────────────────────────────
export async function getFile(
  token: string,
  username: string,
  path: string
): Promise<{ content: any; sha: string } | null> {
  const data = await githubFetch(
    `/repos/${username}/${REPO_NAME}/contents/${path}`,
    token
  )
  if (!data?.content) return null

  // Decode base64 → JSON (browser-safe, no Buffer)
  const raw = atob(data.content.replace(/\n/g, ''))
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
  sha?: string
) {
  // Encode JSON → base64 (browser-safe, no Buffer)
  const json = JSON.stringify(content, null, 2)
  const b64 = btoa(unescape(encodeURIComponent(json)))

  const body: Record<string, any> = {
    message: `Update ${path}`,
    content: b64,
  }
  if (sha) body.sha = sha

  return githubFetch(
    `/repos/${username}/${REPO_NAME}/contents/${path}`,
    token,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    }
  )
}

// ── Bootstrap: create repo + index.json if first time ────────
export async function initializeNoteflow(
  token: string,
  username: string
): Promise<NotesIndex> {
  await getOrCreateRepo(token, username)

  const indexFile = await getFile(token, username, 'index.json')
  if (indexFile) {
    return indexFile.content as NotesIndex
  }

  // First-time setup
  const initialIndex: NotesIndex = {
    version: '1.0',
    notes: [],
    folders: [
      { id: 'personal', name: 'Personal', color: '#7F77DD' },
      { id: 'work',     name: 'Work',     color: '#1D9E75' },
    ],
    tags: [],
    updatedAt: new Date().toISOString(),
  }
  await saveFile(token, username, 'index.json', initialIndex)
  return initialIndex
}
