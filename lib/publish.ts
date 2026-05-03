// lib/publish.ts
// Publishes a note as a public JSON file on GitHub
// Public URL: mynotes.bytecores.in/@{username}/{slug}

import { Note } from '@/types'
import { getFile, saveFile, githubFetch, getOrCreatePublicRepo, PUBLIC_REPO_NAME } from './github'

function makeSlug(title: string): string {
  const s = title
    .toLowerCase()
    .trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') 
    .slice(0, 60)
  return s || `note-${Math.random().toString(36).slice(2, 7)}`
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

  // ── Global Registration ──
  // We notify the central registry that a new user has published content.
  // This ensures the global feed is updated instantly without waiting for GitHub Search indexing.
  try {
    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    }).catch(err => console.warn('[Publish] Registration ping failed:', err))
  } catch (e) {}

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
      { headers: { Accept: 'application/vnd.github.v3+json' }, next: { revalidate: 60 } }
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

// Fetch all notes globally across all discovered authors
export async function getGlobalFeed(currentUser?: string | null): Promise<any[]> {
  const { notes } = await getAdminStats(currentUser)
  return notes
}

export async function getAdminStats(currentUser?: string | null): Promise<{
  notes: any[],
  authors: string[],
  userStats: { login: string, noteCount: number }[]
}> {
  let authors = ['coderafroj']
  const adminUser = 'coderafroj'

  // 1. Try to fetch authors from the Central Registry (Reliable & Instant)
  try {
    const res = await fetch(`https://api.github.com/repos/${adminUser}/${PUBLIC_REPO_NAME}/contents/registry.json`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      next: { revalidate: 60 } // Fast revalidation
    })
    if (res.ok) {
      const data = await res.json()
      if (data.content) {
        const list = JSON.parse(atob(data.content.replace(/\n/g, '')))
        if (Array.isArray(list)) {
          authors = Array.from(new Set([...authors, ...list]))
          console.log(`[Discovery] Loaded ${list.length} authors from Central Registry.`)
        }
      }
    }
  } catch (e) {
    console.warn("[Discovery] Central Registry unavailable, falling back to Search API.")
  }

  // 2. Fallback: Search GitHub for any "noteflow-public" repositories (Dynamic Discovery)
  // This picks up anyone not yet in the registry.
  if (authors.length <= 2) { 
    try {
      const headers: Record<string, string> = { 
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Noteflow-Global-Feed'
      }
      
      if (process.env.GITHUB_TOKEN) {
         headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
      }
      
      const searchRes = await fetch('https://api.github.com/search/repositories?q=noteflow-public+in:name&per_page=100', {
         headers,
         next: { revalidate: 3600 } 
      })
      
      if (searchRes.ok) {
         const data = await searchRes.json()
         if (data.items) {
           const foundAuthors = data.items.map((repo: any) => repo.owner.login)
           authors = Array.from(new Set([...authors, ...foundAuthors]))
         }
      }
    } catch (e) {
      console.warn("[Discovery] GitHub Search API failed.")
    }
  }

  if (currentUser && !authors.includes(currentUser)) {
    authors.push(currentUser)
  }

  const allNotes: any[] = []
  const userStats: { login: string, noteCount: number }[] = []
  
  const indexPromises = authors.map(async (author) => {
    try {
      const notes = await getPublicIndex(author)
      if (notes.length > 0) {
        userStats.push({ login: author, noteCount: notes.length })
      }
      return notes.map(n => ({ ...n, author }))
    } catch (e) {
      return []
    }
  })
  
  const results = await Promise.all(indexPromises)
  for (const authorNotes of results) {
    allNotes.push(...authorNotes)
  }
  
  allNotes.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  
  return { 
    notes: allNotes, 
    authors, 
    userStats: userStats.sort((a, b) => b.noteCount - a.noteCount)
  }
}

// Fetch a single published note (no auth needed)
export async function getPublicNote(
  username: string,
  slug: string
): Promise<any | null> {
  const url = `https://api.github.com/repos/${username}/${PUBLIC_REPO_NAME}/contents/public/${slug}.json`
  try {
    const res = await fetch(url, { 
      headers: { Accept: 'application/vnd.github.v3+json' },
      cache: 'no-store' 
    })
    if (!res.ok) {
      console.warn(`[getPublicNote] Fetch failed (${res.status}): ${url}`)
      return null
    }
    const data = await res.json()
    if (!data.content) return null
    const raw = atob(data.content.replace(/\n/g, ''))
    return JSON.parse(raw)
  } catch (e) {
    console.error(`[getPublicNote] Error fetching ${url}:`, e)
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
