// lib/search.ts
import Fuse from 'fuse.js'
import { NoteIndexEntry } from '@/types'

export const searchNotes = (notes: NoteIndexEntry[], query: string) => {
  if (!query.trim()) return notes
  // Tag filter: #tagname
  if (query.startsWith('#')) {
    const tag = query.slice(1).toLowerCase()
    return notes.filter((n) => n.tags.some((t) => t.toLowerCase().includes(tag)))
  }
  const fuse = new Fuse(notes, {
    keys: ['title', 'contentPreview', 'tags'],
    threshold: 0.35,
    distance: 200,
    includeScore: true,
  })
  return fuse.search(query).map((r) => r.item)
}
