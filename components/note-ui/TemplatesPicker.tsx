'use client'
// components/note-ui/TemplatesPicker.tsx
// Usage: show this when creating a new note, pass onSelect callback

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

export const TEMPLATES: Record<string, { label: string; emoji: string; content: object }> = {
  blank: {
    label: 'Blank',
    emoji: '📄',
    content: { type: 'doc', content: [{ type: 'paragraph' }] },
  },
  meeting: {
    label: 'Meeting Notes',
    emoji: '🤝',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Meeting Notes' }] },
        { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Date: ' }, { type: 'text', text: new Date().toLocaleDateString() }] },
        { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Attendees: ' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Agenda' }] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] }] }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Discussion' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Action Items' }] },
        { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Task 1' }] }] }] },
      ],
    },
  },
  daily: {
    label: 'Daily Journal',
    emoji: '📔',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🌅 Morning' }] },
        { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'italic' }], text: 'How are you feeling today?' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '✅ Today\'s Goals' }] },
        { type: 'taskList', content: [
          { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Goal 1' }] }] },
          { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Goal 2' }] }] },
        ]},
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🌙 Evening Reflection' }] },
        { type: 'paragraph' },
      ],
    },
  },
  todo: {
    label: 'Todo List',
    emoji: '✅',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Todo List' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🔴 High Priority' }] },
        { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Important task' }] }] }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🟡 Medium Priority' }] },
        { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Normal task' }] }] }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🟢 Low Priority' }] },
        { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Someday task' }] }] }] },
      ],
    },
  },
  project: {
    label: 'Project Plan',
    emoji: '🚀',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Project Name' }] },
        { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Goal: ' }, { type: 'text', text: 'What are we building?' }] },
        { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Deadline: ' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '📋 Overview' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🎯 Milestones' }] },
        { type: 'taskList', content: [
          { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Phase 1' }] }] },
          { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Phase 2' }] }] },
        ]},
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '⚠️ Risks' }] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Risk 1' }] }] }] },
      ],
    },
  },
  idea: {
    label: 'Idea Capture',
    emoji: '💡',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '💡 Idea: ' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The Problem' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'My Solution' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Why it matters' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Next Steps' }] },
        { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Validate idea' }] }] }] },
      ],
    },
  },
}

interface TemplatesPickerProps {
  onSelect: (templateKey: string, content: object, title: string) => void
  onClose: () => void
}

export default function TemplatesPicker({ onSelect, onClose }: TemplatesPickerProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="font-bold text-lg">Choose a template</h2>
          <button onClick={onClose} className="text-[var(--muted-text)] hover:text-[var(--foreground)] p-1">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4">
          {Object.entries(TEMPLATES).map(([key, tmpl]) => (
            <button
              key={key}
              onClick={() => onSelect(key, tmpl.content, tmpl.label === 'Blank' ? 'Untitled Note' : tmpl.label)}
              className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--p-purple)] hover:bg-[var(--p-purple)]/5 transition-all text-left group"
            >
              <span className="text-2xl">{tmpl.emoji}</span>
              <span className="text-sm font-medium group-hover:text-[var(--p-purple)] transition-colors">
                {tmpl.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
