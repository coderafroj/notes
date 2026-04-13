// lib/sync.ts
import { Note, NoteIndexEntry, NotesIndex } from '@/types'
import { db } from './db'
import { getFile, saveFile, deleteFile, initializeNoteflow } from './github'

export async function syncToGitHub(token: string, username: string) {
  const remoteIndex = await initializeNoteflow(token, username)
  for (const entry of remoteIndex.notes) {
    const local = await db.notes.get(entry.id)
    if (!local || new Date(entry.updatedAt) > new Date(local.updatedAt)) {
      const remote = await getFile(token, username, `notes/note-${entry.id}.json`)
      if (remote) await db.notes.put({ ...remote.content, sha: remote.sha })
    }
  }
  const localNotes = await db.notes.toArray()
  for (const local of localNotes) {
    const entry = remoteIndex.notes.find((n) => n.id === local.id)
    if (!entry || new Date(local.updatedAt) > new Date(entry.updatedAt)) {
      await saveNoteWithSync(token, username, local)
    }
  }
}

export async function saveNoteWithSync(token: string, username: string, note: Note) {
  await db.notes.put(note)
  try {
    const existing = await getFile(token, username, `notes/note-${note.id}.json`)
    const res = await saveFile(token, username, `notes/note-${note.id}.json`, note, existing?.sha ?? note.sha)
    const newSha = res?.content?.sha
    if (newSha) await db.notes.update(note.id, { sha: newSha })
    await updateIndex(token, username, note)
  } catch (e) {
    console.error('[sync] GitHub push failed, saved locally:', e)
  }
}

export async function deleteNoteWithSync(token: string, username: string, noteId: string) {
  await db.notes.delete(noteId)
  try {
    const file = await getFile(token, username, `notes/note-${noteId}.json`)
    if (file?.sha) await deleteFile(token, username, `notes/note-${noteId}.json`, file.sha)
    const indexFile = await getFile(token, username, 'index.json')
    if (indexFile) {
      const index: NotesIndex = indexFile.content
      index.notes = index.notes.filter((n) => n.id !== noteId)
      index.updatedAt = new Date().toISOString()
      rebuildTags(index)
      await saveFile(token, username, 'index.json', index, indexFile.sha)
    }
  } catch (e) {
    console.error('[sync] delete GitHub failed:', e)
  }
}

async function updateIndex(token: string, username: string, note: Note) {
  const indexFile = await getFile(token, username, 'index.json')
  const index: NotesIndex = indexFile?.content ?? {
    version: '1.0', notes: [], folders: [], tags: [], updatedAt: '',
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
  if (idx >= 0) index.notes[idx] = entry
  else index.notes.unshift(entry)
  index.updatedAt = new Date().toISOString()
  rebuildTags(index)
  await saveFile(token, username, 'index.json', index, indexFile?.sha)
}

function rebuildTags(index: NotesIndex) {
  const counts: Record<string, number> = {}
  for (const n of index.notes) {
    for (const t of n.tags) counts[t] = (counts[t] ?? 0) + 1
  }
  index.tags = Object.entries(counts).map(([name, count]) => ({ name, count }))
}

export function extractText(node: any): string {
  if (!node) return ''
  if (node.type === 'text') return node.text ?? ''
  if (Array.isArray(node.content)) return node.content.map(extractText).join(' ')
  return ''
}
