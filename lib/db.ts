import Dexie, { Table } from 'dexie'
import { Note, Folder, NotesIndex } from '@/types'

export class NoteflowDB extends Dexie {
  notes!: Table<Note>
  folders!: Table<Folder>
  metadata!: Table<{ key: string; value: any }>

  constructor() {
    super('NoteflowDB')

    this.version(1).stores({
      notes: 'id, title, folder, *tags, createdAt, updatedAt',
      folders: 'id, name, parentId',
      metadata: 'key',
    })

    // v2 previously added a "results" (certificate/marksheet) table —
    // removed as an unused/unnecessary feature. Kept as a no-op version
    // bump so existing users' local IndexedDB upgrades cleanly.
    this.version(2).stores({
      results: null,
    })
  }
}

export const db = new NoteflowDB()
