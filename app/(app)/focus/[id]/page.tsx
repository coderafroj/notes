'use client'
// app/(app)/focus/[id]/page.tsx
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { X, Check, Loader2 } from 'lucide-react'
import { Note } from '@/types'
import { getFile } from '@/lib/github'
import { saveNoteWithSync, saveNoteLocal } from '@/lib/sync'
import { db } from '@/lib/db'
import { extractText } from '@/lib/utils'
import { useNoteflowStore } from '@/lib/store'
import Editor from '@/components/editor/Editor'

export default function FocusPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const { data: session } = useSession()
  const { isGuest } = useNoteflowStore()
  const [note, setNote] = useState<Note | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef<Note | null>(null)

  useEffect(() => {
    if (!id) return
    const noteId = id as string
    db.notes.get(noteId).then((l) => { if (l) setNote(l) })
    if (!isGuest && session?.accessToken) {
      getFile(session.accessToken, session.user.login, `notes/note-${noteId}.json`)
        .then((r) => { if (r?.content) { setNote(r.content); db.notes.put({ ...r.content, sha: r.sha }) } })
    }
  }, [id, session, isGuest])

  const save = useCallback(async (n: Note) => {
    if (isGuest) await saveNoteLocal(n)
    else if (session?.accessToken) await saveNoteWithSync(session.accessToken, session.user.login, n)
  }, [session, isGuest])

  const handleChange = useCallback((content: string) => {
    if (!note) return
    const contentText = (() => { try { return extractText(JSON.parse(content)) } catch { return '' } })()
    const updated = { ...note, content, contentText, contentPreview: contentText.slice(0, 200), updatedAt: new Date().toISOString() }
    pending.current = updated; setNote(updated); setSaveStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      if (pending.current) { await save(pending.current); setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000) }
    }, 1500)
  }, [note, save])

  if (!note) return <div className="flex items-center justify-center h-screen"><Loader2 size={22} className="animate-spin text-[var(--muted-text)]" /></div>

  const words = note.contentText?.trim().split(/\s+/).filter(Boolean).length ?? 0

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col animate-in">
      {/* Minimal bar */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10 glass-nav">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[var(--p-purple)]/10 text-[var(--p-purple)] rounded-lg flex items-center justify-center font-bold text-xs shadow-sm shadow-purple-500/10">N</div>
          <input defaultValue={note.title} onBlur={async (e) => { const u = { ...note, title: e.target.value }; setNote(u); await save(u) }}
            className="text-sm font-bold bg-transparent outline-none text-[var(--muted-text)] focus:text-[var(--foreground)] transition-all max-w-xs focus:max-w-md" />
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-text)]">
            {saveStatus === 'saving' && <span className="animate-pulse flex items-center gap-1.5"><Loader2 size={11} className="animate-spin" />Saving</span>}
            {saveStatus === 'saved' && <span className="text-[var(--p-teal)] flex items-center gap-1.5"><Check size={11} />Saved</span>}
            <span className="opacity-40 select-none">|</span>
            <span>{words} words</span>
          </div>
          
          <button onClick={() => router.push(`/note/${note.id}`)} 
            className="interactive-scale flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--muted)] hover:bg-[var(--border)] text-xs font-bold transition-all"
          >
            <X size={14} />Exit Focus
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-8 pt-32 pb-48">
        <Editor content={note.content} onChange={handleChange} editable />
      </div>

      {/* Subtle word count at bottom */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 rounded-2xl glass-card text-[10px] font-bold uppercase tracking-widest text-[var(--muted-text)] shadow-lg shadow-black/5">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--p-teal)] animate-pulse" />
        {words} words
      </div>
    </div>
  )
}

