export interface Note {
  id: string
  title: string
  content: string        // TipTap JSON string
  contentText: string    // Plain text for search
  tags: string[]
  folder: string
  isPinned: boolean
  isFavorite: boolean
  createdAt: string      // ISO date
  updatedAt: string      // ISO date
  attachments: Attachment[]
  sha?: string           // GitHub file SHA (needed for updates)
  color?: NoteColor
}

export type NoteColor = 'default' | 'yellow' | 'green' | 'blue' | 'pink' | 'purple'

export interface Attachment {
  id: string
  name: string
  type: string           // MIME type
  size: number
  url: string            // GitHub raw URL or base64
  createdAt: string
}

// Folder structure
export interface Folder {
  id: string
  name: string
  parentId: string | null
  color: string
  icon: string
  createdAt: string
}

// Index file stored in GitHub repo root
export interface NotesIndex {
  version: string
  notes: NoteIndexEntry[]
  folders: Folder[]
  tags: TagEntry[]
  updatedAt: string
}

export interface NoteIndexEntry {
  id: string
  title: string
  tags: string[]
  folder: string
  isPinned: boolean
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  color?: NoteColor
  sha?: string
  contentPreview: string  // First 150 chars of plain text
}

export interface TagEntry {
  name: string
  color: string
  count: number
}

// App state
export interface AppState {
  notes: NoteIndexEntry[]
  folders: Folder[]
  tags: TagEntry[]
  selectedNoteId: string | null
  selectedFolderId: string // "all" | id
  searchQuery: string
  viewMode: 'grid' | 'list'
  sortBy: 'updatedAt' | 'createdAt' | 'title'
  sortOrder: 'asc' | 'desc'
}
