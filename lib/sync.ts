// ============================================================
// lib/sync.ts — Local-first sync: Dexie ↔ GitHub
// ============================================================

import { Note, NoteIndexEntry, NotesIndex } from '@/types'
import { db } from './db'
import { getFile, saveFile, githubFetch, initializeNoteflow } from './github'

const REPO_NAME = 'noteflow-data'

// -----------------------------------------------------------
// Full sync: pull remote changes into local Dexie DB
// -----------------------------------------------------------
export async function syncToGitHub(token: string, username: string) {
  if (!token || !username) return
  const remoteIndex = await initializeNoteflow(token, username)

  // Pull notes that are newer on remote or missing locally
  for (const remoteEntry of remoteIndex.notes) {
    const localNote = await db.notes.get(remoteEntry.id)
    const remoteIsNewer =
      !localNote ||
      new Date(remoteEntry.updatedAt) > new Date(localNote.updatedAt)

    if (remoteIsNewer) {
      const remoteNote = await getFile(
        token,
        username,
        `notes/note-${remoteEntry.id}.json`
      )
      if (remoteNote) {
        await db.notes.put({ ...remoteNote.content, sha: remoteNote.sha })
      }
    }
  }

  // Push local notes that are newer than remote
  const localNotes = await db.notes.toArray()
  for (const localNote of localNotes) {
    const remoteEntry = remoteIndex.notes.find((n) => n.id === localNote.id)
    const localIsNewer =
      !remoteEntry ||
      new Date(localNote.updatedAt) > new Date(remoteEntry.updatedAt)

    if (localIsNewer) {
      await saveNoteWithSync(token, username, localNote)
    }
  }
}

// -----------------------------------------------------------
// Save a single note: Dexie first, then GitHub + index.json
// -----------------------------------------------------------
export async function saveNoteWithSync(
  token: string | null | undefined,
  username: string | null | undefined,
  note: Note
) {
  // 1. Save locally first — instant feedback
  await db.notes.put(note)

  if (!token || !username) return

  try {
    // 2. Get current SHA of the note file (needed for GitHub update)
    const existingFile = await getFile(
      token,
      username,
      `notes/note-${note.id}.json`
    )
    const fileSha = existingFile?.sha ?? note.sha

    // 3. Push note file to GitHub
    const res = await saveFile(
      token,
      username,
      `notes/note-${note.id}.json`,
      note,
      fileSha
    )

    // 4. Save updated SHA back to local DB
    const newSha = res?.content?.sha
    if (newSha) {
      await db.notes.update(note.id, { sha: newSha })
    }

    // 5. Update index.json
    await updateIndex(token, username, note)
  } catch (error) {
    console.error('[Noteflow] GitHub sync failed — saved locally only:', error)
    // Dexie already has it. Will sync on next app load via syncToGitHub()
  }
}

// -----------------------------------------------------------
// Delete a note: remove from Dexie + GitHub + index.json
// -----------------------------------------------------------
export async function deleteNoteWithSync(
  token: string | null | undefined,
  username: string | null | undefined,
  noteId: string
) {
  // 1. Remove from local DB
  await db.notes.delete(noteId)

  if (!token || !username) return

  try {
    // 2. Get file SHA (required by GitHub DELETE)
    const file = await getFile(token, username, `notes/note-${noteId}.json`)
    if (file?.sha) {
      await githubFetch(
        `/repos/${username}/${REPO_NAME}/contents/notes/note-${noteId}.json`,
        token,
        {
          method: 'DELETE',
          body: JSON.stringify({
            message: `Delete note ${noteId}`,
            sha: file.sha,
          }),
        }
      )
    }

    // 3. Remove from index.json
    const indexFile = await getFile(token, username, 'index.json')
    if (indexFile) {
      const index: NotesIndex = indexFile.content
      index.notes = index.notes.filter((n) => n.id !== noteId)
      index.updatedAt = new Date().toISOString()
      await saveFile(token, username, 'index.json', index, indexFile.sha)
    }
  } catch (error) {
    console.error('[Noteflow] Failed to delete from GitHub:', error)
  }
}

// -----------------------------------------------------------
// Toggle favorite — updates Dexie + GitHub + index.json
// -----------------------------------------------------------
export async function toggleFavoriteWithSync(
  token: string | null | undefined,
  username: string | null | undefined,
  noteId: string,
  isFavorite: boolean
) {
  await db.notes.update(noteId, { isFavorite })
  const note = await db.notes.get(noteId)
  if (note) {
    await saveNoteWithSync(token, username, { ...note, isFavorite })
  }
}

// -----------------------------------------------------------
// Internal: rebuild the NoteIndexEntry and patch index.json
// -----------------------------------------------------------
async function updateIndex(token: string, username: string, note: Note) {
  const indexFile = await getFile(token, username, 'index.json')
  const index: NotesIndex = indexFile?.content ?? {
    version: '1.0',
    notes: [],
    folders: [],
    tags: [],
    updatedAt: '',
  }

  const entry: NoteIndexEntry = {
    id: note.id,
    title: note.title,
    contentPreview: note.contentText?.slice(0, 200) ?? '',
    tags: note.tags,
    folder: note.folder,
    isPinned: note.isPinned,
    isFavorite: note.isFavorite,
    color: note.color,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }

  const idx = index.notes.findIndex((n) => n.id === note.id)
  if (idx >= 0) {
    index.notes[idx] = entry
  } else {
    index.notes.push(entry)
  }

  // Rebuild tags count from all notes
  const tagCounts: Record<string, number> = {}
  for (const n of index.notes) {
    for (const tag of n.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1
    }
  }
  index.tags = Object.entries(tagCounts).map(([name, count]) => ({ name, count }))
  index.updatedAt = new Date().toISOString()

  await saveFile(token, username, 'index.json', index, indexFile?.sha)
}
