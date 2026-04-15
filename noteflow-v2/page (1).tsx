'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { ChevronLeft, Star, Trash2, Check, Download, Loader2, Globe, Lock, History, Maximize2, Pencil, Type } from 'lucide-react'
import Editor from '@/components/editor/Editor'
import DrawingCanvas from '@/components/editor/DrawingCanvas'
import NoteMetaBar from '@/components/note-ui/NoteMetaBar'
import PublishToggle from '@/components/note-ui/PublishToggle'
import { Note } from '@/types'
import { cn, extractText } from '@/lib/utils'
import { exportToPDF, exportToMarkdown } from '@/lib/export'
import { getFile } from '@/lib/github'
import { saveNoteWithSync, saveNoteLocal, deleteNoteWithSync, deleteNoteLocal } from '@/lib/sync'
import { db } from '@/lib/db'
import { useNoteflowStore } from '@/lib/store'

export default function NotePage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { isGuest, removeNote } = useNoteflowStore()

  const [note, setNote] = useState<Note | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'write' | 'draw'>('write')

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingNote = useRef<Note | null>(null)

  // Load note
  useEffect(() => {
    if (!id) return
    const noteId = id as string
    db.notes.get(noteId).then((local) => {
      if (local) { setNote(local); setIsLoading(false) }
    })
    if (!isGuest && session?.accessToken) {
      getFile(session.accessToken, session.user.login, `notes/note-${noteId}.json`)
        .then((res) => {
          if (res?.content) { setNote(res.content as Note); db.notes.put({ ...(res.content as Note), sha: res.sha }) }
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [id, session, isGuest])

  const saveNote = useCallback(async (updated: Note) => {
    if (isGuest) await saveNoteLocal(updated)
    else if (session?.accessToken) await saveNoteWithSync(session.accessToken, session.user.login, updated)
  }, [session, isGuest])

  // Debounced content save
  const handleContentChange = useCallback((content: string) => {
    if (!note) return
    const contentText = (() => { try { return extractText(JSON.parse(content)) } catch { return '' } })()
    const updated: Note = { ...note, content, contentText, contentPreview: contentText.slice(0, 200), updatedAt: new Date().toISOString() }
    pendingNote.current = updated
    setNote(updated)
    setSaveStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      if (!pendingNote.current) return
      try { await saveNote(pendingNote.current); setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2500) }
      catch { setSaveStatus('error') }
    }, 1500)
  }, [note, saveNote])

  const handleTitleBlur = useCallback(async (title: string) => {
    if (!note) return
    const updated = { ...note, title, updatedAt: new Date().toISOString() }
    setNote(updated)
    await saveNote(updated)
  }, [note, saveNote])

  const handleToggleFavorite = useCallback(async () => {
    if (!note) return
    const updated = { ...note, isFavorite: !note.isFavorite }
    setNote(updated); await saveNote(updated)
  }, [note, saveNote])

  const handleDelete = useCallback(async () => {
    if (!note || !confirm('Delete this note?')) return
    setIsDeleting(true)
    if (isGuest) await deleteNoteLocal(note.id)
    else if (session?.accessToken) await deleteNoteWithSync(session.accessToken, session.user.login, note.id)
    removeNote(note.id)
    router.push('/')
  }, [note, session, isGuest])

  const handleDrawingChange = useCallback(async (drawingData: string) => {
    if (!note) return
    const updated = { ...note, drawingData, updatedAt: new Date().toISOString() }
    setNote(updated); await saveNote(updated)
  }, [note, saveNote])

  if (isLoading) return (
    <div className="flex items-center justify-center h-full text-[var(--muted-text)]">
      <Loader2 size={22} className="animate-spin" />
    </div>
  )
  if (!note) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <p className="text-[var(--muted-text)]">Note not found.</p>
      <button onClick={() => router.push('/')} className="text-[var(--p-purple)] underline text-sm">Back to notes</button>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      {/* Header */}
      <header className="px-4 lg:px-6 py-3 flex items-center justify-between border-b border-[var(--border)] sticky top-0 bg-[var(--background)] z-20 gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)] shrink-0">
            <ChevronLeft size={18} />
          </button>
          <input key={note.id} defaultValue={note.title} onBlur={(e) => handleTitleBlur(e.target.value)}
            className="text-base lg:text-lg font-bold bg-transparent outline-none focus:text-[var(--p-purple)] transition-colors min-w-0 flex-1 truncate"
            placeholder="Note Title"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Save status */}
          <div className="text-xs text-[var(--muted-text)] flex items-center gap-1.5 min-w-[90px] justify-end">
            {saveStatus === 'saving' && <span className="animate-pulse flex items-center gap-1"><Loader2 size={11} className="animate-spin" />Saving</span>}
            {saveStatus === 'saved' && <span className="text-[var(--p-teal)] flex items-center gap-1"><Check size={11} />Saved</span>}
            {saveStatus === 'error' && <span className="text-red-500">Failed</span>}
          </div>

          {/* Write/Draw tabs */}
          <div className="flex bg-[var(--muted)] rounded-lg p-0.5 border border-[var(--border)]">
            {([['write', <Type size={13} />], ['draw', <Pencil size={13} />]] as const).map(([tab, icon]) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all capitalize',
                  activeTab === tab ? 'bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-text)]'
                )}
              >
                {icon}
                <span className="hidden sm:inline">{tab}</span>
              </button>
            ))}
          </div>

          {/* Publish toggle — github users only */}
          {!isGuest && session?.accessToken && (
            <PublishToggle note={note} token={session.accessToken} username={session.user.login}
              onUpdate={(updated) => setNote(updated)}
            />
          )}

          <button onClick={handleToggleFavorite} className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all" title="Favorite">
            <Star size={18} className={note.isFavorite ? 'fill-[var(--p-amber)] text-[var(--p-amber)]' : 'text-[var(--muted-text)]'} />
          </button>

          <button onClick={() => router.push(`/focus/${note.id}`)} className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)]" title="Focus mode">
            <Maximize2 size={18} />
          </button>

          {!isGuest && (
            <button onClick={() => router.push(`/history/${note.id}`)} className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)] hidden sm:flex" title="History">
              <History size={18} />
            </button>
          )}

          {/* Export */}
          <div className="relative">
            <button onClick={() => setShowExportMenu((v) => !v)} className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)]" title="Export">
              <Download size={18} />
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-2 w-44 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden z-40">
                  <button onClick={() => { exportToPDF(note.title, '.tiptap'); setShowExportMenu(false) }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--muted)] transition-colors">Export as PDF</button>
                  <button onClick={() => { exportToMarkdown(note.title, note.contentText ?? ''); setShowExportMenu(false) }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--muted)] transition-colors">Export as Markdown</button>
                </div>
              </>
            )}
          </div>

          <button onClick={handleDelete} disabled={isDeleting} className="p-2 rounded-xl transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 disabled:opacity-50" title="Delete">
            {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          </button>
        </div>
      </header>

      {/* Meta bar */}
      <NoteMetaBar note={note} onUpdate={async (changes) => {
        const updated = { ...note, ...changes, updatedAt: new Date().toISOString() }
        setNote(updated); await saveNote(updated)
      }} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'write' ? (
          <div className="px-5 lg:px-16 xl:px-24 py-8 max-w-4xl mx-auto">
            <Editor content={note.content} onChange={handleContentChange} editable />
          </div>
        ) : (
          <div className="p-5">
            <DrawingCanvas data={note.drawingData} onChange={handleDrawingChange} />
          </div>
        )}
      </div>
    </div>
  )
}
