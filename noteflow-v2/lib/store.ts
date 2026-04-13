// lib/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppState, NoteIndexEntry, Folder, TagEntry } from '@/types'

interface NoteflowStore extends AppState {
  // Data setters
  setNotes: (notes: NoteIndexEntry[]) => void
  setFolders: (folders: Folder[]) => void
  setTags: (tags: TagEntry[]) => void
  setSelectedNoteId: (id: string | null) => void
  setSelectedFolderId: (id: string) => void
  setSearchQuery: (query: string) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setSortBy: (sortBy: 'updatedAt' | 'createdAt' | 'title') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  // UI state
  focusMode: boolean
  setFocusMode: (v: boolean) => void
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (v: boolean) => void
  // Note actions (optimistic update)
  updateNoteInList: (id: string, patch: Partial<NoteIndexEntry>) => void
  removeNoteFromList: (id: string) => void
  addNoteToList: (entry: NoteIndexEntry) => void
}

export const useNoteflowStore = create<NoteflowStore>()(
  persist(
    (set) => ({
      notes: [],
      folders: [],
      tags: [],
      selectedNoteId: null,
      selectedFolderId: 'all',
      searchQuery: '',
      viewMode: 'grid',
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      theme: 'system',
      focusMode: false,
      commandPaletteOpen: false,

      setNotes: (notes) => set({ notes }),
      setFolders: (folders) => set({ folders }),
      setTags: (tags) => set({ tags }),
      setSelectedNoteId: (id) => set({ selectedNoteId: id }),
      setSelectedFolderId: (id) => set({ selectedFolderId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (order) => set({ sortOrder: order }),
      setTheme: (theme) => set({ theme }),
      setFocusMode: (v) => set({ focusMode: v }),
      setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),

      updateNoteInList: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        })),
      removeNoteFromList: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      addNoteToList: (entry) =>
        set((s) => ({ notes: [entry, ...s.notes] })),
    }),
    {
      name: 'noteflow-ui',
      partialize: (s) => ({
        viewMode: s.viewMode,
        sortBy: s.sortBy,
        sortOrder: s.sortOrder,
        theme: s.theme,
        selectedFolderId: s.selectedFolderId,
      }),
    }
  )
)
