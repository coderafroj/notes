import { Note, NoteIndexEntry, Folder, NotesIndex, Attachment } from '@/types'

const GITHUB_API_BASE = 'https://api.github.com'
const REPO_NAME = 'noteflow-data'

export async function githubFetch(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${GITHUB_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
  })

  if (!res.ok) {
    if (res.status === 404) return null
    const error = await res.json()
    throw new Error(error.message || 'GitHub API error')
  }

  if (res.status === 204) return true
  return res.json()
}

export async function getOrCreateRepo(token: string, username: string) {
  const repo = await githubFetch(`/repos/${username}/${REPO_NAME}`, token)
  if (repo) return repo

  // Create repo if not exists
  return githubFetch('/user/repos', token, {
    method: 'POST',
    body: JSON.stringify({
      name: REPO_NAME,
      private: true,
      description: 'Your notes data for Noteflow',
      auto_init: true,
    }),
  })
}

export async function getFile(token: string, username: string, path: string) {
  const data = await githubFetch(`/repos/${username}/${REPO_NAME}/contents/${path}`, token)
  if (!data || !data.content) return null
  
  const content = Buffer.from(data.content, 'base64').toString('utf-8')
  return {
    content: JSON.parse(content),
    sha: data.sha
  }
}

export async function saveFile(token: string, username: string, path: string, content: any, sha?: string) {
  const body: any = {
    message: `Update ${path}`,
    content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
  }
  if (sha) body.sha = sha

  return githubFetch(`/repos/${username}/${REPO_NAME}/contents/${path}`, token, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function initializeNoteflow(token: string, username: string) {
  await getOrCreateRepo(token, username)
  
  const indexFile = await getFile(token, username, 'index.json')
  if (!indexFile) {
    const initialIndex: NotesIndex = {
      version: '1.0',
      notes: [],
      folders: [],
      tags: [],
      updatedAt: new Date().toISOString(),
    }
    await saveFile(token, username, 'index.json', initialIndex)
    return initialIndex
  }
  
  return indexFile.content as NotesIndex
}
