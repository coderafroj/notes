import { create } from 'zustand'
import { AppState, NoteIndexEntry, Folder, TagEntry } from '@/types'

interface NoteflowStore extends AppState {
  setNotes: (notes: NoteIndexEntry[]) => void
  setFolders: (folders: Folder[]) => void
  setTags: (tags: TagEntry[]) => void
  setSelectedNoteId: (id: string | null) => void
  setSelectedFolderId: (id: string) => void
  setSearchQuery: (query: string) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setSortBy: (sortBy: 'updatedAt' | 'createdAt' | 'title') => void
  setSortOrder: (order: 'asc' | 'desc') => void
}

export const useNoteflowStore = create<NoteflowStore>((set) => ({
  notes: [],
  folders: [],
  tags: [],
  selectedNoteId: null,
  selectedFolderId: 'all',
  searchQuery: '',
  viewMode: 'grid',
  sortBy: 'updatedAt',
  sortOrder: 'desc',

  setNotes: (notes) => set({ notes }),
  setFolders: (folders) => set({ folders }),
  setTags: (tags) => set({ tags }),
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (order) => set({ sortOrder: order }),
}))
