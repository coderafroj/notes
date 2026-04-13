'use client'

// ============================================================
// app/(app)/note/[id]/page.tsx — Note editor (Improved version)
// ============================================================

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Star,
  Trash2,
  Share,
  Check,
  Download,
  Loader2,
  Focus,
  History,
  Pin,
  PinOff,
  Palette,
  Tag,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import Editor from '@/components/editor/Editor'
import DrawingCanvas from '@/components/editor/DrawingCanvas'
import PublishToggle from '@/components/note-ui/PublishToggle'
import NoteMetaBar from '@/components/note-ui/NoteMetaBar'
import { Note } from '@/types'
import { cn, formatDate, NOTE_COLORS } from '@/lib/utils'
import { exportToPDF, exportToMarkdown } from '@/lib/export'
import { getFile, getFileHistory } from '@/lib/github'
import { saveNoteWithSync, deleteNoteWithSync, extractText } from '@/lib/sync'
import { db } from '@/lib/db'
import { useNoteflowStore } from '@/lib/store'

export default function NotePage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { focusMode, setFocusMode, updateNoteInList, removeNoteFromList } = useNoteflowStore()

  const [note, setNote] = useState<Note | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showTagEditor, setShowTagEditor] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'write' | 'draw'>('write')

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestNote = useRef<Note | null>(null)

  // ── Load note ──────────────────────────────────────────────
  useEffect(() => {
    if (!id) return
    const noteId = id as string

    // Try local DB first
    db.notes.get(noteId).then((local) => {
      if (local) {
        setNote(local)
        latestNote.current = local
        if (!session?.accessToken) setIsLoading(false)
      }
    })

    // Fetch authoritative version from GitHub
    if (session?.accessToken && session?.user?.login) {
      getFile(session.accessToken, session.user.login, `notes/note-${noteId}.json`)
        .then((res) => {
          if (res?.content) {
            const n = res.content as Note
            setNote(n)
            latestNote.current = n
            db.notes.put({ ...n, sha: res.sha })
          }
        })
        .finally(() => setIsLoading(false))
    }
  }, [id, session])

  // ── Auto-save debounced ────────────────────────────────────
  const handleContentChange = useCallback((content: string) => {
    if (!latestNote.current) return
    
    let contentText = ''
    try {
      contentText = extractText(JSON.parse(content))
    } catch {}

    const updated: Note = {
      ...latestNote.current,
      content,
      contentText,
      contentPreview: contentText.slice(0, 200),
      updatedAt: new Date().toISOString(),
    }
    
    latestNote.current = updated
    setNote(updated)
    setSaveStatus('saving')

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      if (!latestNote.current || !session?.accessToken) return
      try {
        await saveNoteWithSync(session.accessToken, session.user.login, latestNote.current)
        updateNoteInList(latestNote.current.id, {
          title: latestNote.current.title,
          contentPreview: latestNote.current.contentPreview,
          updatedAt: latestNote.current.updatedAt,
        })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2500)
      } catch {
        setSaveStatus('error')
      }
    }, 1500)
  }, [session, updateNoteInList])

  // ── Save Helpers ───────────────────────────────────────────
  const saveNote = useCallback(async (patch: Partial<Note>) => {
    if (!latestNote.current || !session?.accessToken) return
    const updated = { ...latestNote.current, ...patch, updatedAt: new Date().toISOString() }
    setNote(updated)
    latestNote.current = updated
    await saveNoteWithSync(session.accessToken, session.user.login, updated)
    updateNoteInList(updated.id, patch as any)
  }, [session, updateNoteInList])

  const handleTitleBlur = (title: string) => {
    if (!note || title === note.title) return
    saveNote({ title })
  }

  const handleToggleFavorite = () => saveNote({ isFavorite: !note?.isFavorite })
  const handleTogglePin = () => saveNote({ isPinned: !note?.isPinned })
  const handleColorChange = (color: string | null) => {
    saveNote({ color })
    setShowColorPicker(false)
  }

  // ── Tag Actions ───────────────────────────────────────────
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ',') return
    e.preventDefault()
    const tag = tagInput.trim().replace(/^#/, '').toLowerCase()
    if (!tag || note?.tags.includes(tag)) {
      setTagInput('')
      return
    }
    saveNote({ tags: [...(note?.tags ?? []), tag] })
    setTagInput('')
  }

  const handleRemoveTag = (tag: string) => {
    saveNote({ tags: (note?.tags ?? []).filter((t) => t !== tag) })
  }

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!note || !session?.accessToken) return
    if (!confirm('Delete this note? This cannot be undone.')) return
    setIsDeleting(true)
    removeNoteFromList(note.id)
    await deleteNoteWithSync(session.accessToken, session.user.login, note.id)
    router.push('/')
  }, [note, session, router, removeNoteFromList])

  // ── History ───────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    if (!session?.accessToken || !note) return
    setShowHistory(true)
    try {
      const commits = await getFileHistory(session.accessToken, session.user.login, `notes/note-${note.id}.json`)
      setHistory(commits ?? [])
    } catch (e) {
      console.error('Failed to load history:', e)
    }
  }, [session, note])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-[var(--muted-text)]" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-[var(--muted-text)]">Note not found.</p>
        <button onClick={() => router.push('/')} className="text-[var(--p-purple)] underline text-sm">
          Back to notes
        </button>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-[var(--background)] transition-all', focusMode && 'lg:pl-0')}>
      {/* Header */}
      {!focusMode && (
        <header className="px-4 lg:px-6 py-3 flex items-center justify-between border-b border-[var(--border)] sticky top-0 bg-[var(--background)] z-20 gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={() => router.back()} className="p-1.5 rounded-xl hover:bg-[var(--muted)] text-[var(--muted-text)] shrink-0 transition-all">
              <ChevronLeft size={20} />
            </button>
            {note.color && (
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: `var(--p-${note.color})` }} />
            )}
            <input
              key={note.id}
              defaultValue={note.title}
              onBlur={(e) => handleTitleBlur(e.target.value)}
              className="text-base font-bold bg-transparent outline-none focus:text-[var(--p-purple)] transition-colors min-w-0 flex-1 truncate"
              placeholder="Note Title"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Save status */}
            <div className="mr-2 text-xs text-[var(--muted-text)] hidden sm:flex items-center gap-1.5 min-w-[110px] justify-end">
              {saveStatus === 'saving' && <><Loader2 size={11} className="animate-spin" /> Saving...</>}
              {saveStatus === 'saved' && <span className="text-[var(--p-teal)] flex items-center gap-1"><Check size={11} /> Saved</span>}
              {saveStatus === 'error' && <span className="text-red-500">Error</span>}
            </div>

            {/* Write/Draw Tabs */}
            <div className="flex bg-[var(--muted)] rounded-xl p-1 mx-2">
              {(['write', 'draw'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize',
                    activeTab === t
                      ? 'bg-[var(--card-bg)] text-[var(--p-purple)] shadow-sm'
                      : 'text-[var(--muted-text)] hover:text-[var(--foreground)]'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {session && (
              <PublishToggle
                note={note}
                token={session.accessToken}
                username={session.user.login}
                onUpdate={(updated) => setNote(updated)}
              />
            )}

            <button onClick={handleTogglePin} className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all" title={note.isPinned ? 'Unpin' : 'Pin'}>
              {note.isPinned ? <PinOff size={18} className="text-[var(--p-teal)]" /> : <Pin size={18} className="text-[var(--muted-text)]" />}
            </button>

            <button onClick={handleToggleFavorite} className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all" title="Favorite">
              <Star size={18} className={note.isFavorite ? 'fill-[var(--p-amber)] text-[var(--p-amber)]' : 'text-[var(--muted-text)]'} />
            </button>

            {/* Color picker */}
            <div className="relative">
              <button onClick={() => setShowColorPicker((v) => !v)} className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)]" title="Note color">
                <Palette size={18} />
              </button>
              {showColorPicker && (
                <div className="absolute right-0 mt-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-xl p-3 z-50 flex flex-col gap-2 min-w-[160px]">
                  <p className="text-[10px] text-[var(--muted-text)] font-bold uppercase tracking-wider">Color</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleColorChange(null)} className={cn('w-6 h-6 rounded-full border-2 bg-[var(--muted)]', !note.color ? 'border-[var(--foreground)]' : 'border-transparent')} />
                    {NOTE_COLORS.map((c) => (
                      <button 
                        key={c.name} 
                        onClick={() => handleColorChange(c.name)}
                        className={cn('w-6 h-6 rounded-full border-2 transition-transform hover:scale-110', note.color === c.name ? 'border-[var(--foreground)] scale-110' : 'border-transparent')}
                        style={{ backgroundColor: c.hex }} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setShowTagEditor((v) => !v)} className={cn('p-2 rounded-xl hover:bg-[var(--muted)] transition-all', showTagEditor ? 'text-[var(--p-purple)]' : 'text-[var(--muted-text)]')} title="Tags">
              <Tag size={18} />
            </button>

            <button onClick={loadHistory} className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)] hidden sm:flex" title="Version history">
              <History size={18} />
            </button>

            <button onClick={() => setFocusMode(!focusMode)} className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)] hidden lg:flex" title="Focus mode">
              <Maximize2 size={18} />
            </button>

            {/* Export dropdown */}
            <div className="relative">
              <button onClick={() => setShowExportMenu((v) => !v)} className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)]" title="Export">
                <Download size={18} />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-150">
                  <button onClick={() => { exportToPDF(note.title, '.tiptap'); setShowExportMenu(false) }} className="w-full text-left px-4 py-3 text-sm hover:bg-[var(--muted)] transition-colors">Export as PDF</button>
                  <button onClick={() => { exportToMarkdown(note.title, note.contentText ?? ''); setShowExportMenu(false) }} className="w-full text-left px-4 py-3 text-sm hover:bg-[var(--muted)] transition-colors">Export as Markdown</button>
                </div>
              )}
            </div>

            <button onClick={handleDelete} disabled={isDeleting} className="p-2 rounded-xl transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 disabled:opacity-50" title="Delete">
              {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
          </div>
        </header>
      )}

      {/* Focus mode exit button */}
      {focusMode && (
        <button onClick={() => setFocusMode(false)} className="fixed top-4 right-4 z-50 p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] shadow-lg text-[var(--muted-text)] hover:text-[var(--foreground)]">
          <Minimize2 size={16} />
        </button>
      )}

      {/* Tag editor bar */}
      {showTagEditor && (
        <div className="px-6 py-2.5 border-b border-[var(--border)] bg-[var(--background)] flex flex-wrap items-center gap-2">
          {note.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--muted)] text-xs text-[var(--muted-text)] font-medium">
              #{tag}
              <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500"><X size={11} /></button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tag, press Enter..."
            className="text-xs bg-transparent outline-none text-[var(--muted-text)] placeholder:text-[var(--muted-text)]/50 min-w-[140px]"
          />
        </div>
      )}

      <NoteMetaBar
        note={note}
        onUpdate={async (changes) => {
          const updated = { ...note, ...changes, updatedAt: new Date().toISOString() }
          setNote(updated)
          latestNote.current = updated
          await saveNoteWithSync(session?.accessToken, session?.user?.login, updated)
          updateNoteInList(updated.id, changes as any)
        }}
      />

      {/* Editor body */}
      <div className={cn('flex-1 overflow-y-auto', focusMode ? 'px-6 lg:px-48 py-16' : 'px-6 lg:px-24 py-12')}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          {activeTab === 'write' ? (
            <Editor
              content={note.content}
              onChange={handleContentChange}
              color={note.color}
              editable
            />
          ) : (
            <div className="py-2">
              <DrawingCanvas
                data={note.drawingData}
                onChange={async (d) => {
                  const updated = { ...note, drawingData: d, updatedAt: new Date().toISOString() }
                  setNote(updated)
                  latestNote.current = updated
                  await saveNoteWithSync(session?.accessToken, session?.user?.login, updated)
                }}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* History panel Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={() => setShowHistory(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
              <h2 className="font-bold text-sm">Version History</h2>
              <button onClick={() => setShowHistory(false)} className="p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-text)]"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-2">
              {history.length === 0 ? (
                <p className="text-sm text-center text-[var(--muted-text)] py-8">No history available</p>
              ) : history.map((commit: any) => (
                <div key={commit.sha} className="p-3 rounded-xl bg-[var(--muted)] flex items-start gap-3">
                  <img src={commit.author?.avatar_url} alt="" className="w-7 h-7 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{commit.commit?.message}</p>
                    <p className="text-[10px] text-[var(--muted-text)]">{formatDate(commit.commit?.author?.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
