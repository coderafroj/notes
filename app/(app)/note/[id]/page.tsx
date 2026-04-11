'use client'

// ============================================================
// app/note/[id]/page.tsx — Note editor (fully wired)
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
} from 'lucide-react'
import Editor from '@/components/editor/Editor'
import NoteMetaBar from '@/components/note-ui/NoteMetaBar'
import { Note } from '@/types'
import { cn } from '@/lib/utils'
import { exportToPDF, exportToMarkdown } from '@/lib/export'
import { getFile } from '@/lib/github'
import { saveNoteWithSync, deleteNoteWithSync } from '@/lib/sync'
import { db } from '@/lib/db'

export default function NotePage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [note, setNote] = useState<Note | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingNote = useRef<Note | null>(null)

  // ── Load note: Dexie first (fast), then GitHub ────────────
  useEffect(() => {
    if (!id) return

    const noteId = id as string

    // Try local DB first for instant load
    db.notes.get(noteId).then((local) => {
      if (local) {
        setNote(local)
      }
      // If we don't have a session, we're in guest mode, so we're done loading
      if (!session?.accessToken) {
        setIsLoading(false)
      }
    })

    // Then fetch from GitHub (authoritative) if logged in
    if (session?.accessToken && session?.user?.login) {
      getFile(session.accessToken, session.user.login, `notes/note-${noteId}.json`)
        .then((res) => {
          if (res?.content) {
            setNote(res.content as Note)
            db.notes.put({ ...(res.content as Note), sha: res.sha })
          }
        })
        .catch((e) => console.error('[NotePage] fetch failed:', e))
        .finally(() => setIsLoading(false))
    }
  }, [id, session])

  // ── Auto-save with 1.5s debounce ─────────────────────────
  const handleContentChange = useCallback(
    (content: string) => {
      if (!note) return

      // Extract plain text for search/preview
      let contentText = ''
      try {
        const parsed = JSON.parse(content)
        contentText = extractText(parsed)
      } catch {
        contentText = ''
      }

      const updated: Note = {
        ...note,
        content,
        contentText,
        contentPreview: contentText.slice(0, 200),
        updatedAt: new Date().toISOString(),
      }
      pendingNote.current = updated
      setNote(updated)
      setSaveStatus('saving')

      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        if (!pendingNote.current) return
        try {
          await saveNoteWithSync(
            session?.accessToken,
            session?.user?.login,
            pendingNote.current
          )
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus('idle'), 2500)
        } catch {
          setSaveStatus('error')
        }
      }, 1500)
    },
    [note, session]
  )

  // ── Save title on blur ────────────────────────────────────
  const handleTitleBlur = useCallback(
    async (title: string) => {
      if (!note || !session?.accessToken) return
      const updated = { ...note, title, updatedAt: new Date().toISOString() }
      setNote(updated)
      await saveNoteWithSync(session?.accessToken, session?.user?.login, updated)
    },
    [note, session]
  )

  // ── Toggle favorite ───────────────────────────────────────
  const handleToggleFavorite = useCallback(async () => {
    if (!note || !session?.accessToken) return
    if (!note) return
    const updated = { ...note, isFavorite: !note.isFavorite }
    setNote(updated)
    await saveNoteWithSync(session?.accessToken, session?.user?.login, updated)
  }, [note, session])

  // ── Delete note ───────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!note) return
    if (!confirm('Delete this note? This cannot be undone.')) return
    setIsDeleting(true)
    await deleteNoteWithSync(session?.accessToken, session?.user?.login, note.id)
    router.push('/')
  }, [note, session, router])

  // ── Share (copy link) ─────────────────────────────────────
  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--muted-text)]">
        <Loader2 size={24} className="animate-spin" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-[var(--muted-text)]">Note not found.</p>
        <button
          onClick={() => router.push('/')}
          className="text-[var(--p-purple)] underline text-sm"
        >
          Back to notes
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[var(--background)] max-w-full overflow-hidden">
      {/* Header */}
      <header className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-[var(--border)] sticky top-0 bg-[var(--background)] z-20">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={() => router.back()}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)] shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
          <input
            key={note.id}
            defaultValue={note.title}
            onBlur={(e) => handleTitleBlur(e.target.value)}
            className="text-base sm:text-lg font-bold bg-transparent outline-none focus:text-[var(--p-purple)] transition-colors min-w-0 flex-1 truncate"
            placeholder="Note Title"
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
          {/* Save status - reduced width on mobile */}
          <div className="mr-1 sm:mr-3 text-[10px] sm:text-xs font-medium text-[var(--muted-text)] flex items-center gap-1 sm:gap-2 min-w-[70px] sm:min-w-[120px] justify-end">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 animate-pulse">
                <Loader2 size={10} className="animate-spin" />
                <span className="hidden xs:inline">Saving...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-[var(--p-teal)] flex items-center gap-1">
                <Check size={10} />
                <span className="hidden xs:inline">Saved</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-500">Error</span>
            )}
          </div>

          <button
            onClick={handleToggleFavorite}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-[var(--muted)] transition-all shrink-0"
            title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star
              size={18}
              className={
                note.isFavorite
                  ? 'fill-[var(--p-amber)] text-[var(--p-amber)]'
                  : 'text-[var(--muted-text)]'
              }
            />
          </button>

          <button
            onClick={handleShare}
            className="hidden md:flex p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)]"
            title="Copy link"
          >
            <Share size={20} />
          </button>

          <button
            onClick={() => router.push(`/focus/${note.id}`)}
            className="hidden sm:flex p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)]"
            title="Focus Mode"
          >
            <Focus size={20} />
          </button>

          <button
            onClick={() => router.push(`/history/${note.id}`)}
            className="hidden sm:flex p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)]"
            title="Version History"
          >
            <History size={20} />
          </button>

          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)]"
              title="Export"
            >
              <Download size={18} />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-50">
                {/* Mobile only visible actions in menu */}
                <button
                  onClick={handleShare}
                  className="md:hidden w-full text-left px-4 py-3 text-sm hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)]"
                >
                  Share Link
                </button>
                <button
                  onClick={() => router.push(`/focus/${note.id}`)}
                  className="sm:hidden w-full text-left px-4 py-3 text-sm hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)]"
                >
                  Focus Mode
                </button>
                <button
                  onClick={() => router.push(`/history/${note.id}`)}
                  className="sm:hidden w-full text-left px-4 py-3 text-sm hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)]"
                >
                  Version History
                </button>
                
                <button
                  onClick={() => {
                    exportToPDF(note.title, '.tiptap')
                    setShowExportMenu(false)
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-[var(--muted)] transition-colors"
                >
                  Export as PDF
                </button>
                <button
                  onClick={() => {
                    exportToMarkdown(note.title, note.contentText ?? '')
                    setShowExportMenu(false)
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-[var(--muted)] transition-colors"
                >
                  Export as Markdown
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 sm:p-2 rounded-xl transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 disabled:opacity-50"
            title="Delete note"
          >
            {isDeleting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}
          </button>
        </div>
      </header>

      <NoteMetaBar
        note={note}
        onUpdate={async (changes) => {
          const updated = { ...note, ...changes, updatedAt: new Date().toISOString() }
          setNote(updated)
          await saveNoteWithSync(session?.accessToken, session?.user?.login, updated)
        }}
      />

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-24 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-[var(--muted)] text-xs text-[var(--muted-text)] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <Editor
            content={note.content}
            onChange={handleContentChange}
            editable
          />
        </motion.div>
      </div>
    </div>
  )
}

// ── Helper: extract plain text from TipTap JSON ──────────────
function extractText(node: any): string {
  if (!node) return ''
  if (node.type === 'text') return node.text ?? ''
  if (node.content) {
    return node.content.map(extractText).join(' ')
  }
  return ''
}
