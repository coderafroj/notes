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
  content: string
  contentText: string
  contentPreview: string
  tags: string[]
  folder: string
  isPinned: boolean
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  attachments: Attachment[]
  color: string | null
  sha?: string
  // Public publishing
  isPublished: boolean
  slug: string
  publishedAt?: string
  // Drawing canvas data
  drawingData?: string
}

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
  isPublished: boolean
  slug: string
  publishedAt?: string
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

export interface NotesIndex {
  version: string
  notes: NoteIndexEntry[]
  folders: Folder[]
  tags: TagEntry[]
  updatedAt: string
}

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
  theme: 'light' | 'dark' | 'system'
  focusMode: boolean
  commandPaletteOpen: boolean
}


