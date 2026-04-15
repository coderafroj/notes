// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(d)
}

// Alias used by NoteCard and other components
export const formatRelative = formatDate

export function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Extract plain text from a TipTap JSON node tree.
 */
export function extractText(node: any): string {
  if (!node) return ''
  if (node.type === 'text') return node.text ?? ''
  if (Array.isArray(node.content)) {
    return node.content.map(extractText).join(' ')
  }
  return ''
}

/**
 * Convert a title into a URL-safe slug.
 */
export function makeSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export const NOTE_COLORS = [
  { name: 'purple', label: 'Purple', hex: '#7F77DD' },
  { name: 'teal',   label: 'Teal',   hex: '#1D9E75' },
  { name: 'amber',  label: 'Amber',  hex: '#EF9F27' },
  { name: 'blue',   label: 'Blue',   hex: '#378ADD' },
  { name: 'coral',  label: 'Coral',  hex: '#D85A30' },
  { name: 'pink',   label: 'Pink',   hex: '#D4537E' },
]

export const NOTE_TEMPLATES = [
  {
    id: 'blank',
    label: 'Blank',
    icon: '📄',
    content: '',
  },
  {
    id: 'meeting',
    label: 'Meeting Notes',
    icon: '🤝',
    content: JSON.stringify({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Meeting Notes' }] },
        { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Date: ' }, { type: 'text', text: new Date().toLocaleDateString() }] },
        { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Attendees: ' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Agenda' }] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] }] }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Action Items' }] },
        { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Action item 1' }] }] }] },
      ],
    }),
  },
  {
    id: 'journal',
    label: 'Daily Journal',
    icon: '📔',
    content: JSON.stringify({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: "Today I'm grateful for..." }] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: "Today's focus" }] },
        { type: 'paragraph', content: [{ type: 'text', text: '' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Thoughts' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '' }] },
      ],
    }),
  },
  {
    id: 'todo',
    label: 'Todo List',
    icon: '✅',
    content: JSON.stringify({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Todo List' }] },
        { type: 'taskList', content: [
          { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Task 1' }] }] },
          { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Task 2' }] }] },
          { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Task 3' }] }] },
        ]},
      ],
    }),
  },
  {
    id: 'project',
    label: 'Project Plan',
    icon: '🚀',
    content: JSON.stringify({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Project Name' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Overview' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Brief description of the project...' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Goals' }] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Goal 1' }] }] }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Milestones' }] },
        { type: 'taskList', content: [
          { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Milestone 1' }] }] },
        ]},
      ],
    }),
  },
]
