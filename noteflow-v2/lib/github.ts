// lib/github.ts
import { NotesIndex } from '@/types'

const API = 'https://api.github.com'
export const REPO_NAME = 'noteflow-data'

export async function githubFetch(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) {
    if (res.status === 404) return null
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? `GitHub ${res.status}`)
  }
  if (res.status === 204) return true
  return res.json()
}

export async function getOrCreateRepo(token: string, username: string) {
  const repo = await githubFetch(`/repos/${username}/${REPO_NAME}`, token)
  if (repo) return repo
  return githubFetch('/user/repos', token, {
    method: 'POST',
    body: JSON.stringify({
      name: REPO_NAME,
      private: true,
      description: 'Noteflow data — your notes backup',
      auto_init: true,
    }),
  })
}

export async function getFile(token: string, username: string, path: string) {
  const data = await githubFetch(`/repos/${username}/${REPO_NAME}/contents/${path}`, token)
  if (!data?.content) return null
  try {
    const raw = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))))
    return { content: JSON.parse(raw), sha: data.sha as string }
  } catch {
    return null
  }
}

export async function saveFile(token: string, username: string, path: string, content: any, sha?: string) {
  const json = JSON.stringify(content, null, 2)
  const b64 = btoa(unescape(encodeURIComponent(json)))
  const body: any = { message: `noteflow: update ${path}`, content: b64 }
  if (sha) body.sha = sha
  return githubFetch(`/repos/${username}/${REPO_NAME}/contents/${path}`, token, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function deleteFile(token: string, username: string, path: string, sha: string) {
  return githubFetch(`/repos/${username}/${REPO_NAME}/contents/${path}`, token, {
    method: 'DELETE',
    body: JSON.stringify({ message: `noteflow: delete ${path}`, sha }),
  })
}

export async function getFileHistory(token: string, username: string, path: string) {
  return githubFetch(`/repos/${username}/${REPO_NAME}/commits?path=${path}&per_page=10`, token)
}

export async function initializeNoteflow(token: string, username: string): Promise<NotesIndex> {
  await getOrCreateRepo(token, username)
  const indexFile = await getFile(token, username, 'index.json')
  if (indexFile) return indexFile.content as NotesIndex
  const initial: NotesIndex = {
    version: '1.0',
    notes: [],
    folders: [
      { id: 'personal', name: 'Personal', color: '#7F77DD' },
      { id: 'work', name: 'Work', color: '#1D9E75' },
      { id: 'ideas', name: 'Ideas', color: '#EF9F27' },
    ],
    tags: [],
    updatedAt: new Date().toISOString(),
  }
  await saveFile(token, username, 'index.json', initial)
  return initial
}
