'use client'
// app/(app)/focus/[id]/page.tsx
// Full-screen distraction-free writing mode
// Link to it from note page: router.push(`/focus/${note.id}`)

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { X, Check, Loader2 } from 'lucide-react'
import { Note } from '@/types'
import { getFile } from '@/lib/github'
import { saveNoteWithSync } from '@/lib/sync'
import { db } from '@/lib/db'
import Editor from '@/components/editor/Editor'

export default function FocusPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [note, setNote] = useState<Note | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingNote = useRef<Note | null>(null)

  useEffect(() => {
    if (!id || !session?.accessToken || !session?.user?.login) return
    const noteId = id as string
    db.notes.get(noteId).then((local) => { if (local) setNote(local) })
    getFile(session.accessToken, session.user.login, `notes/note-${noteId}.json`).then((res) => {
      if (res?.content) { setNote(res.content); db.notes.put({ ...res.content, sha: res.sha }) }
    })
  }, [id, session])

  const handleContentChange = useCallback((content: string) => {
    if (!note) return
    let contentText = ''
    try { const p = JSON.parse(content); contentText = extractText(p) } catch {}
    const updated = { ...note, content, contentText, contentPreview: contentText.slice(0, 200), updatedAt: new Date().toISOString() }
    pendingNote.current = updated
    setNote(updated)
    setSaveStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      if (!pendingNote.current || !session?.accessToken || !session?.user?.login) return
      await saveNoteWithSync(session.accessToken, session.user.login, pendingNote.current)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1500)
  }, [note, session])

  if (!note) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 size={24} className="animate-spin text-[var(--muted-text)]" />
    </div>
  )

  const wordCount = note.contentText?.trim().split(/\s+/).filter(Boolean).length ?? 0

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Minimal top bar */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-8 py-3 z-10 bg-[var(--background)]/80 backdrop-blur-sm">
        <input
          defaultValue={note.title}
          onBlur={async (e) => {
            if (!session?.accessToken || !session?.user?.login) return
            const updated = { ...note, title: e.target.value }
            setNote(updated)
            await saveNoteWithSync(session.accessToken, session.user.login, updated)
          }}
          className="text-sm font-medium bg-transparent outline-none text-[var(--muted-text)] focus:text-[var(--foreground)] transition-colors max-w-xs"
          placeholder="Untitled"
        />

        <div className="flex items-center gap-4 text-xs text-[var(--muted-text)]">
          {saveStatus === 'saving' && <span className="animate-pulse flex items-center gap-1"><Loader2 size={11} className="animate-spin" /> Saving</span>}
          {saveStatus === 'saved' && <span className="text-[var(--p-teal)] flex items-center gap-1"><Check size={11} /> Saved</span>}
          <span>{wordCount} words</span>
          <button
            onClick={() => router.push(`/note/${note.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] transition-all"
          >
            <X size={13} />
            Exit focus
          </button>
        </div>
      </div>

      {/* Editor — centered, wide, generous padding */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 pt-20 pb-32">
        <Editor content={note.content} onChange={handleContentChange} editable />
      </div>

      {/* Word count bottom center */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-xs text-[var(--muted-text)] bg-[var(--muted)] px-4 py-1.5 rounded-full border border-[var(--border)]">
        {wordCount} words
      </div>
    </div>
  )
}

function extractText(node: any): string {
  if (!node) return ''
  if (node.type === 'text') return node.text ?? ''
  if (node.content) return node.content.map(extractText).join(' ')
  return ''
}
