import { Note, NotesIndex } from '@/types'
import { db } from './db'
import { getFile, saveFile, initializeNoteflow } from './github'

export async function syncToGitHub(token: string, username: string) {
  // 1. Get local modified notes
  const localNotes = await db.notes.toArray()
  
  // 2. Fetch remote index
  const remoteIndex = await initializeNoteflow(token, username)
  
  // 3. For each note in index, if not in local or local is older, fetch it
  for (const remoteNoteEntry of remoteIndex.notes) {
    const localNote = await db.notes.get(remoteNoteEntry.id)
    
    if (!localNote || new Date(remoteNoteEntry.updatedAt) > new Date(localNote.updatedAt)) {
      const remoteNote = await getFile(token, username, `notes/note-${remoteNoteEntry.id}.json`)
      if (remoteNote) {
        await db.notes.put({ ...remoteNote.content, sha: remoteNote.sha })
      }
    }
  }

  // 4. If local has notes not in remote or newer than remote, push them
  // (Simplified for this version: we focus on reliable fetching first)
}

export async function saveNoteWithSync(token: string, username: string, note: Note) {
  // 1. Save to local DB immediately for instant feel
  await db.notes.put(note)
  
  // 2. Push to GitHub in background
  try {
    const res = await saveFile(token, username, `notes/note-${note.id}.json`, note, note.sha)
    // Update local SHA if it was a new file or update
    if (res && res.content && res.content.sha) {
      await db.notes.update(note.id, { sha: res.content.sha })
    }
  } catch (error) {
    console.error('Failed to sync to GitHub:', error)
    // Local DB still has the change, will retry later
  }
}
