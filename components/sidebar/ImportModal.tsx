'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileJson, FileText, X, Loader2, FileCode } from 'lucide-react'
import { marked } from 'marked'
import { v4 as uuidv4 } from 'uuid'
import { Note } from '@/types'
import { useNoteflowStore } from '@/lib/store'
import { saveNoteLocal, saveNoteWithSync } from '@/lib/sync'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function ImportModal({ isOpen, onClose }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { isGuest, selectedFolderId } = useNoteflowStore()
  const { data: session } = useSession()
  const router = useRouter()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true)
    else if (e.type === 'dragleave') setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0])
    }
  }

  const processFile = async (file: File) => {
    setIsImporting(true)
    setError(null)
    try {
      const text = await file.text()
      const ext = file.name.split('.').pop()?.toLowerCase()
      
      let htmlContent = ''
      let title = file.name.replace(/\.[^/.]+$/, "")

      if (ext === 'json') {
        try {
          const parsed = JSON.parse(text)
          // Attempt to detect if it's already a Note object or just Tiptap JSON
          if (parsed.content) {
             htmlContent = JSON.stringify(parsed.content)
             title = parsed.title || title
          } else {
             htmlContent = JSON.stringify(parsed)
          }
        } catch {
          throw new Error("Invalid JSON format")
        }
      } else if (ext === 'md' || ext === 'markdown') {
        htmlContent = await marked.parse(text)
      } else if (ext === 'txt') {
        htmlContent = `<p>${text.replace(/\n/g, '<br/>')}</p>`
      } else {
        throw new Error("Unsupported file type. Please upload .md, .txt, or .json")
      }

      // Create new Note
      const id = uuidv4()
      const now = new Date().toISOString()
      const note: Note = {
        id,
        title,
        content: htmlContent, // Tiptap handles raw HTML and JSON strings gracefully on setContent
        contentText: text.slice(0, 500),
        contentPreview: text.slice(0, 200),
        tags: ['imported'],
        folder: selectedFolderId === 'all' ? 'all' : selectedFolderId,
        isPinned: false,
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
        attachments: [],
        color: null,
        isPublished: false,
        slug: `imported-${id.slice(0, 6)}`,
      }

      if (isGuest) {
        await saveNoteLocal(note)
      } else if (session?.accessToken && session?.user?.login) {
        await saveNoteWithSync(session.accessToken, session.user.login, note)
      }

      router.push(`/note/${id}`)
      onClose()
    } catch (e: any) {
      setError(e.message || "Failed to process file")
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-[32px] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-[var(--border)] overflow-hidden"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-[#888780] hover:text-[#0f0f0f] dark:hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-black mb-2 text-[var(--foreground)]">Import Note</h2>
          <p className="text-[var(--muted-text)] font-medium mb-8">Bring your notes from other platforms into Noteflow.</p>

          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-[24px] p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer
              ${isDragging ? 'border-[var(--p-purple)] bg-[var(--p-purple)]/5' : 'border-[#e5e4df] dark:border-white/10 hover:bg-[#f8f8f6] dark:hover:bg-white/5'}
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".md,.markdown,.txt,.json" 
              onChange={handleFileSelect}
            />
            
            <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--p-purple)] mb-4">
              {isImporting ? <Loader2 size={32} className="animate-spin" /> : <UploadCloud size={32} />}
            </div>
            
            <p className="text-base font-bold text-[var(--foreground)] mb-1">
              {isImporting ? 'Importing...' : 'Click or drag file to import'}
            </p>
            <p className="text-sm text-[var(--muted-text)] font-medium">
              Supports .md, .txt, and .json
            </p>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold flex items-center gap-2">
              <X size={16} /> {error}
            </div>
          )}

          <div className="mt-8 flex justify-center gap-6">
            <div className="flex flex-col items-center gap-2 opacity-60">
              <FileCode size={20} />
              <span className="text-[10px] font-black uppercase tracking-wider">Markdown</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-60">
              <FileJson size={20} />
              <span className="text-[10px] font-black uppercase tracking-wider">JSON</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-60">
              <FileText size={20} />
              <span className="text-[10px] font-black uppercase tracking-wider">Plain Text</span>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
