'use client'
// components/ui/TemplateModal.tsx
import { NOTE_TEMPLATES } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface Props {
  onSelect: (templateContent: string, templateTitle: string) => void
  onClose: () => void
}

export default function TemplateModal({ onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-bold text-base">Choose a template</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-text)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {NOTE_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() =>
                onSelect(t.content, t.label === 'Blank' ? 'Untitled Note' : t.label)
              }
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)]',
                'hover:border-[var(--p-purple)] hover:bg-[var(--p-purple)]/5 transition-all group'
              )}
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--p-purple)]">
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
