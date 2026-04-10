import Fuse from 'fuse.js'
import { NoteIndexEntry } from '@/types'

export const searchNotes = (notes: NoteIndexEntry[], query: string) => {
  if (!query) return notes

  const fuse = new Fuse(notes, {
    keys: ['title', 'contentPreview', 'tags'],
    threshold: 0.3,
    distance: 100,
  })

  return fuse.search(query).map(result => result.item)
}
