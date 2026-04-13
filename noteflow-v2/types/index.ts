// types/index.ts — UPDATED with public publishing + drawing support

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

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
}

declare module 'next-auth' {
  interface Session {
    accessToken: string
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      login: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    login?: string
  }
}
