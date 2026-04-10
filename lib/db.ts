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
  }
}

export const db = new NoteflowDB()
