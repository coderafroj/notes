'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, Star, Trash2, Check, Download, 
  Loader2, History, Maximize2, Pencil, Type, MoreVertical, 
  Share2, Save, Cloud
} from 'lucide-react'
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
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const { data: session } = useSession()
  const { isGuest, removeNote } = useNoteflowStore()

  const [note, setNote] = useState<Note | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showMoreMenu, setShowMoreMenu] = useState(false)
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
          if (res?.content) { 
            const n = res.content as Note
            setNote(n)
            db.notes.put({ ...n, sha: res.sha }) 
          }
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

  // Content change
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
    if (!note || !confirm('Delete this note permanently?')) return
    setIsDeleting(true)
    if (isGuest) await deleteNoteLocal(note.id)
    else if (session?.accessToken) await deleteNoteWithSync(session.accessToken, session.user.login, note.id)
    removeNote(note.id)
    router.push('/dashboard')
  }, [note, session, isGuest, removeNote, router])

  const handleDrawingChange = useCallback(async (drawingData: string) => {
    if (!note) return
    const updated = { ...note, drawingData, updatedAt: new Date().toISOString() }
    setNote(updated); await saveNote(updated)
  }, [note, saveNote])

  if (isLoading) return (
    <div className="flex items-center justify-center h-full text-[#888780]">
      <Loader2 size={32} className="animate-spin text-[#7F77DD] opacity-50" />
    </div>
  )
  if (!note) return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="text-6xl">🔍</div>
      <p className="text-[17px] font-bold text-[#888780]">Note was removed or relocated.</p>
      <button onClick={() => router.push('/dashboard')} className="px-8 py-3 bg-[#7F77DD] text-white rounded-2xl font-black shadow-lg">Back to Shell</button>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-[#f8f8f6] text-[#0f0f0f]">
      {/* Premium Header */}
      <header className="px-4 md:px-6 h-[72px] flex items-center justify-between border-b border-[#e5e4df] sticky top-0 bg-white/90 backdrop-blur-xl z-30 gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button onClick={() => router.back()} className="p-2.5 rounded-xl hover:bg-[#f2f1ed] transition-all text-[#888780] active:scale-95 shrink-0">
            <ChevronLeft size={20} strokeWidth={3} />
          </button>
          <div className="flex flex-col min-w-0 flex-1">
             <input key={note.id} defaultValue={note.title} onBlur={(e) => handleTitleBlur(e.target.value)}
              className="text-[17px] md:text-xl font-black bg-transparent outline-none focus:text-[#7F77DD] transition-colors truncate"
              placeholder="Article title..."
            />
            <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#888780]">
               {saveStatus === 'saving' ? (
                 <span className="flex items-center gap-1.5 text-[#7F77DD] animate-pulse">
                    <Cloud size={10} className="animate-bounce" /> Syncing
                 </span>
               ) : saveStatus === 'saved' ? (
                 <span className="flex items-center gap-1.5 text-[#1D9E75]">
                    <Check size={11} strokeWidth={3} /> Updated
                 </span>
               ) : (
                 <span className="flex items-center gap-1.5 opacity-40">
                    <Save size={10} /> Local Cache
                 </span>
               )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Write/Draw Tabs - Hidden on mobile, toggleable? or just small */}
          <div className="hidden md:flex bg-[#f2f1ed] rounded-2xl p-1 border border-[#e5e4df]">
            {([['write', <Type size={16} key="w" />], ['draw', <Pencil size={16} key="d" />]] as const).map(([tab, icon]) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-tighter',
                  activeTab === tab ? 'bg-white text-[#0f0f0f] shadow-sm' : 'text-[#888780] hover:text-[#0f0f0f]'
                )}
              >
                {icon}
                <span>{tab}</span>
              </button>
            ))}
          </div>

          {!isGuest && session?.accessToken && (
            <div className="hidden sm:block">
              <PublishToggle note={note} token={session.accessToken} username={session.user.login}
                onUpdate={(updated) => setNote(updated)}
              />
            </div>
          )}

          <button onClick={handleToggleFavorite} className="p-2.5 rounded-xl hover:bg-[#f2f1ed] transition-all active:scale-90" title="Favorite">
            <Star size={20} className={note.isFavorite ? 'fill-[#EF9F27] text-[#EF9F27]' : 'text-[#888780]'} />
          </button>

          {/* More Menu */}
          <div className="relative">
            <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="p-2.5 rounded-xl hover:bg-[#f2f1ed] transition-all active:scale-90 text-[#888780]" title="More Options">
              <MoreVertical size={20} />
            </button>
            <AnimatePresence>
              {showMoreMenu && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-white border border-[#e5e4df] rounded-[24px] shadow-2xl overflow-hidden z-50 p-2"
                  >
                    <button onClick={() => { setActiveTab(activeTab === 'write' ? 'draw' : 'write'); setShowMoreMenu(false) }}
                      className="md:hidden w-full text-left px-4 py-3 text-[13px] font-black uppercase text-[#0f0f0f] hover:bg-[#f8f8f6] rounded-xl flex items-center gap-3"
                    >
                      {activeTab === 'write' ? <Pencil size={18} /> : <Type size={18} />}
                      Switch to {activeTab === 'write' ? 'Drawing' : 'Typing'}
                    </button>
                    {!isGuest && (
                      <button onClick={() => { router.push(`/history/${note.id}`); setShowMoreMenu(false) }}
                        className="w-full text-left px-4 py-3 text-[13px] font-black uppercase text-[#888780] hover:bg-[#f8f8f6] rounded-xl flex items-center gap-3"
                      >
                        <History size={18} /> History
                      </button>
                    )}
                    <button onClick={() => { router.push(`/focus/${note.id}`); setShowMoreMenu(false) }}
                      className="w-full text-left px-4 py-3 text-[13px] font-black uppercase text-[#888780] hover:bg-[#f8f8f6] rounded-xl flex items-center gap-3"
                    >
                      <Maximize2 size={18} /> Focus Mode
                    </button>
                    <div className="h-px bg-[#f2f1ed] my-1" />
                    <button onClick={() => { exportToPDF(note.title, '.tiptap'); setShowMoreMenu(false) }}
                      className="w-full text-left px-4 py-3 text-[13px] font-black uppercase text-[#0f0f0f] hover:bg-[#f8f8f6] rounded-xl flex items-center gap-3"
                    >
                      <Download size={18} /> Export PDF
                    </button>
                    <button onClick={() => { exportToMarkdown(note.title, note.contentText ?? ''); setShowMoreMenu(false) }}
                      className="w-full text-left px-4 py-3 text-[13px] font-black uppercase text-[#0f0f0f] hover:bg-[#f8f8f6] rounded-xl flex items-center gap-3"
                    >
                      <Share2 size={18} /> Export Markdown
                    </button>
                    <div className="h-px bg-[#f2f1ed] my-1" />
                    <button onClick={handleDelete} disabled={isDeleting}
                      className="w-full text-left px-4 py-3 text-[13px] font-black uppercase text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-3"
                    >
                      {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      Destroy Note
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Meta Bar */}
      <NoteMetaBar note={note} onUpdate={async (changes) => {
        const updated = { ...note, ...changes, updatedAt: new Date().toISOString() }
        setNote(updated); await saveNote(updated)
      }} />

      {/* Content Engine */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'write' ? (
          <div className="px-4 md:px-12 lg:px-16 xl:px-24 py-8 md:py-12 max-w-4xl mx-auto">
            <Editor content={note.content} onChange={handleContentChange} editable color={note.color} />
          </div>
        ) : (
          <div className="p-4 md:p-8 h-full">
            <DrawingCanvas data={note.drawingData} onChange={handleDrawingChange} />
          </div>
        )}
      </div>
    </div>
  )
}
