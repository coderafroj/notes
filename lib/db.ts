import Dexie, { Table } from 'dexie'
import { Note, Folder, NotesIndex } from '@/types'
import { ResultRecord } from '@/types/result'

export class NoteflowDB extends Dexie {
  notes!: Table<Note>
  folders!: Table<Folder>
  metadata!: Table<{ key: string; value: any }>
  results!: Table<ResultRecord>

  constructor() {
    super('NoteflowDB')
    
    this.version(1).stores({
      notes: 'id, title, folder, *tags, createdAt, updatedAt',
      folders: 'id, name, parentId',
      metadata: 'key',
    })

    this.version(2).stores({
      results: 'id, studentName, rollNumber, createdAt'
    })
  }
}

export const db = new NoteflowDB()
