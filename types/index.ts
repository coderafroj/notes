// ============================================================
// types/index.ts — All shared types for Noteflow
// ============================================================

export interface Attachment {
  id: string
  name: string
  url: string        // base64 data URL or external URL
  type: string       // MIME type
  size: number       // bytes
}

// Full note — stored in notes/note-{id}.json on GitHub + Dexie
export interface Note {
  id: string
  title: string
  content: string          // TipTap JSON (stringified)
  contentText: string      // Plain text extracted from content (for search)
  contentPreview: string   // First ~200 chars of contentText
  tags: string[]
  folder: string           // folder id or 'all'
  isPinned: boolean
  isFavorite: boolean
  createdAt: string        // ISO string
  updatedAt: string        // ISO string
  attachments: Attachment[]
  color: string | null     // 'purple' | 'teal' | 'amber' | 'blue' | null
  sha?: string             // GitHub file SHA — required for updates
}

// Lightweight note — stored in index.json, used in dashboard list
export interface NoteIndexEntry {
  id: string
  title: string
  contentPreview: string
  tags: string[]
  folder: string
  isPinned: boolean
  isFavorite: boolean
  color: string | null
  createdAt: string
  updatedAt: string
}

export interface Folder {
  id: string
  name: string
  color: string
  parentId?: string | null
}

export interface TagEntry {
  name: string
  count: number
}

// Root index.json shape on GitHub
export interface NotesIndex {
  version: string
  notes: NoteIndexEntry[]
  folders: Folder[]
  tags: TagEntry[]
  updatedAt: string
}

// Zustand global app state
export interface AppState {
  notes: NoteIndexEntry[]
  folders: Folder[]
  tags: TagEntry[]
  selectedNoteId: string | null
  selectedFolderId: string
  searchQuery: string
  viewMode: 'grid' | 'list'
  sortBy: 'updatedAt' | 'createdAt' | 'title'
  sortOrder: 'asc' | 'desc'
}

// NextAuth extensions moved to types/next-auth.d.ts
