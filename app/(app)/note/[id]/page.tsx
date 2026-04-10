'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, Star, Trash2, Share, Save, Check, Download } from 'lucide-react'
import Editor from '@/components/editor/Editor'
import { useNoteflowStore } from '@/lib/store'
import { Note } from '@/types'
import { cn } from '@/lib/utils'
import { exportToPDF, exportToMarkdown } from '@/lib/export'

export default function NotePage() {
  const { id } = useParams()
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Mock data for initial UI build
  useEffect(() => {
    // In a real app, we would fetch from DB or GitHub here
    setNote({
      id: id as string,
      title: 'Project Kickoff Notes',
      content: '', 
      contentText: '',
      tags: ['work', 'important'],
      folder: 'all',
      isPinned: false,
      isFavorite: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      color: 'purple'
    })
  }, [id])

  const handleContentChange = useCallback((content: string) => {
    setSaveStatus('saving')
    // Simulate auto-save
    const timer = setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (!note) return null

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <header className="px-6 py-4 flex items-center justify-between border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)]"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <input 
              defaultValue={note.title}
              className="text-lg font-bold bg-transparent outline-none focus:text-[var(--p-purple)] transition-colors"
              placeholder="Note Title"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="mr-4 text-xs font-medium text-[var(--muted-text)] flex items-center gap-2">
            {saveStatus === 'saving' && <span className="animate-pulse">Saving...</span>}
            {saveStatus === 'saved' && <span className="text-[var(--p-teal)] flex items-center gap-1"><Check size={12} /> Saved to GitHub</span>}
          </div>

          <button className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)]">
            <Star size={20} className={note.isFavorite ? "fill-[var(--p-amber)] text-[var(--p-amber)]" : ""} />
          </button>
          <button className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)]">
            <Share size={20} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)]"
            >
              <Download size={20} />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-50">
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
                    exportToMarkdown(note.title, note.content)
                    setShowExportMenu(false)
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-[var(--muted)] transition-colors"
                >
                  Export as Markdown
                </button>
              </div>
            )}
          </div>

          <button className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 lg:px-24 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex gap-2 mb-8">
            {note.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-[var(--muted)] text-xs text-[var(--muted-text)] font-medium">
                #{tag}
              </span>
            ))}
          </div>
          
          <Editor 
            content={note.content} 
            onChange={handleContentChange} 
          />
        </motion.div>
      </div>
    </div>
  )
}
