// lib/publish.ts
// Publishes a note as a public JSON file on GitHub
// Public URL: mynotes.bytecores.in/@{username}/{slug}

import { Note } from '@/types'
import { getFile, saveFile, githubFetch, getOrCreatePublicRepo, PUBLIC_REPO_NAME } from './github'

function makeSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || 'untitled'
}

// Publish note — saves public/{slug}.json to GitHub repo
export async function publishNote(
  token: string,
  username: string,
  note: Note
): Promise<Note> {
  await getOrCreatePublicRepo(token, username)

  const slug = note.slug || makeSlug(note.title)
  const publishedAt = note.publishedAt || new Date().toISOString()

  const publicNote = {
    id: note.id,
    title: note.title,
    content: note.content,
    contentText: note.contentText,
    tags: note.tags,
    author: {
      login: username,
      name: username,
    },
    publishedAt,
    updatedAt: note.updatedAt,
    slug,
  }

  // Save to public/{slug}.json
  const existingFile = await getFile(token, username, `public/${slug}.json`, PUBLIC_REPO_NAME)
  await saveFile(
    token,
    username,
    `public/${slug}.json`,
    publicNote,
    existingFile?.sha,
    PUBLIC_REPO_NAME
  )

  // Update public/index.json (list of all published notes)
  await updatePublicIndex(token, username, {
    id: note.id,
    title: note.title,
    contentPreview: note.contentPreview || note.contentText?.slice(0, 200) || '',
    tags: note.tags,
    slug,
    publishedAt,
    updatedAt: note.updatedAt,
    author: username,
  })

  return { ...note, isPublished: true, slug, publishedAt }
}

// Unpublish — deletes public/{slug}.json
export async function unpublishNote(
  token: string,
  username: string,
  note: Note
): Promise<Note> {
  if (!note.slug) return { ...note, isPublished: false }

  try {
    const file = await getFile(token, username, `public/${note.slug}.json`, PUBLIC_REPO_NAME)
    if (file?.sha) {
      await githubFetch(
        `/repos/${username}/${PUBLIC_REPO_NAME}/contents/public/${note.slug}.json`,
        token,
        {
          method: 'DELETE',
          body: JSON.stringify({
            message: `Unpublish note: ${note.title}`,
            sha: file.sha,
          }),
        }
      )
    }
  } catch (e) {
    console.error('[publish] delete failed:', e)
  }

  // Remove from public index
  await removeFromPublicIndex(token, username, note.slug)

  return { ...note, isPublished: false }
}

// Fetch all published notes for a user (public index)
export async function getPublicIndex(
  username: string
): Promise<any[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${username}/${PUBLIC_REPO_NAME}/contents/public/index.json`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    )
    if (!res.ok) return []
    const data = await res.json()
    if (!data.content) return []
    const raw = atob(data.content.replace(/\n/g, ''))
    return JSON.parse(raw)
  } catch {
    return []
  }
}

// Fetch a single published note (no auth needed)
export async function getPublicNote(
  username: string,
  slug: string
): Promise<any | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${username}/${PUBLIC_REPO_NAME}/contents/public/${slug}.json`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.content) return null
    const raw = atob(data.content.replace(/\n/g, ''))
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function updatePublicIndex(
  token: string,
  username: string,
  entry: any
) {
  const existing = await getFile(token, username, 'public/index.json', PUBLIC_REPO_NAME)
  const list: any[] = existing?.content ?? []
  const idx = list.findIndex((n) => n.slug === entry.slug)
  if (idx >= 0) list[idx] = entry
  else list.unshift(entry)
  await saveFile(token, username, 'public/index.json', list, existing?.sha, PUBLIC_REPO_NAME)
}

async function removeFromPublicIndex(
  token: string,
  username: string,
  slug: string
) {
  const existing = await getFile(token, username, 'public/index.json', PUBLIC_REPO_NAME)
  if (!existing) return
  const list = (existing.content as any[]).filter((n) => n.slug !== slug)
  await saveFile(token, username, 'public/index.json', list, existing.sha, PUBLIC_REPO_NAME)
}
