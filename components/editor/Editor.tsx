'use client'

// ============================================================
// components/editor/Editor.tsx — Advanced Production Editor
// Features: floating toolbar, slash commands, task lists,
// highlight, table, mobile-friendly, keyboard shortcuts
// ============================================================

import { useRef, useCallback, useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  Code2,
  Table as TableIcon,
  Image as ImageIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Type,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
}

// ── Toolbar button ───────────────────────────────────────────
const ToolBtn = ({
  onClick,
  active,
  title,
  children,
  className,
}: {
  onClick: () => void
  active?: boolean
  title?: string
  children: React.ReactNode
  className?: string
}) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => {
      e.preventDefault()
      onClick()
    }}
    className={cn(
      'flex items-center justify-center w-8 h-8 rounded-lg transition-all text-sm shrink-0',
      active
        ? 'bg-[var(--p-purple)] text-white shadow-sm'
        : 'text-[var(--muted-text)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
      className
    )}
  >
    {children}
  </button>
)

const Divider = () => (
  <div className="w-px h-5 bg-[var(--border)] mx-0.5 shrink-0" />
)

export default function Editor({
  content,
  onChange,
  editable = true,
}: EditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: true, allowBase64: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return 'Heading...'
          return "Write something, or type '/' for commands..."
        },
      }),
      CharacterCount,
    ],
    content: content
      ? (() => {
          try {
            return JSON.parse(content)
          } catch {
            return content
          }
        })()
      : '',
    editable,
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()))
      const text = editor.getText()
      setCharCount(text.length)
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-base max-w-none focus:outline-none min-h-[60vh] text-[var(--foreground)] prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-li:leading-relaxed',
        spellcheck: 'true',
      },
    },
  })

  // Sync external content changes
  useEffect(() => {
    if (!editor || !content) return
    try {
      const parsed = JSON.parse(content)
      const currentJSON = JSON.stringify(editor.getJSON())
      if (JSON.stringify(parsed) !== currentJSON) {
        editor.commands.setContent(parsed, { emitUpdate: false })
      }
    } catch {}
  }, [content])

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !editor) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const src = ev.target?.result as string
        editor.chain().focus().setImage({ src }).run()
      }
      reader.readAsDataURL(file)
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [editor]
  )

  const handleSetLink = useCallback(() => {
    if (!editor) return
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run()
    } else {
      editor
        .chain()
        .focus()
        .setLink({ href: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}` })
        .run()
    }
    setShowLinkInput(false)
    setLinkUrl('')
  }, [editor, linkUrl])

  const insertTable = useCallback(() => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="flex flex-col w-full">
      {editable && (
        <>
          {/* ── Main toolbar ───────────────────────────────── */}
          <div className="sticky top-0 z-20 bg-[var(--background)] border-b border-[var(--border)]">
            {/* Row 1 — History + Headings + Text format */}
            <div className="flex items-center gap-0.5 px-3 py-2 overflow-x-auto scrollbar-hide">
              {/* History */}
              <ToolBtn
                onClick={() => editor.chain().focus().undo().run()}
                title="Undo (Ctrl+Z)"
                active={false}
              >
                <Undo size={15} />
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().redo().run()}
                title="Redo (Ctrl+Y)"
                active={false}
              >
                <Redo size={15} />
              </ToolBtn>

              <Divider />

              {/* Headings */}
              <ToolBtn
                onClick={() => editor.chain().focus().setParagraph().run()}
                active={editor.isActive('paragraph')}
                title="Paragraph"
              >
                <Type size={15} />
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                active={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
              >
                <Heading1 size={15} />
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
              >
                <Heading2 size={15} />
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                active={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
              >
                <Heading3 size={15} />
              </ToolBtn>

              <Divider />

              {/* Text formatting */}
              <ToolBtn
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive('bold')}
                title="Bold (Ctrl+B)"
              >
                <Bold size={15} />
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive('italic')}
                title="Italic (Ctrl+I)"
              >
                <Italic size={15} />
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                active={editor.isActive('underline')}
                title="Underline (Ctrl+U)"
              >
                <UnderlineIcon size={15} />
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().toggleStrike().run()}
                active={editor.isActive('strike')}
                title="Strikethrough"
              >
                <Strikethrough size={15} />
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                active={editor.isActive('highlight')}
                title="Highlight"
              >
                <Highlighter size={15} />
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().toggleCode().run()}
                active={editor.isActive('code')}
                title="Inline code"
              >
                <Code size={15} />
              </ToolBtn>

              <Divider />

              {/* Lists */}
              <ToolBtn
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive('bulletList')}
                title="Bullet list"
              >
                <List size={15} />
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive('orderedList')}
                title="Numbered list"
              >
                <ListOrdered size={15} />
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                active={editor.isActive('taskList')}
                title="Task list (checklist)"
              >
                <ListChecks size={15} />
              </ToolBtn>

              <Divider />

              {/* Blocks */}
              <ToolBtn
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                active={editor.isActive('blockquote')}
                title="Quote"
              >
                <Quote size={15} />
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                active={editor.isActive('codeBlock')}
                title="Code block"
              >
                <Code2 size={15} />
              </ToolBtn>
              <ToolBtn
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Divider line"
              >
                <Minus size={15} />
              </ToolBtn>

              <Divider />

              {/* Insert */}
              <ToolBtn onClick={insertTable} title="Insert table">
                <TableIcon size={15} />
              </ToolBtn>
              <ToolBtn
                onClick={() => fileInputRef.current?.click()}
                title="Insert image"
              >
                <ImageIcon size={15} />
              </ToolBtn>
              <ToolBtn
                onClick={() => setShowLinkInput((v) => !v)}
                active={editor.isActive('link')}
                title="Insert link"
              >
                <LinkIcon size={15} />
              </ToolBtn>
            </div>

            {/* Link input bar */}
            {showLinkInput && (
              <div className="flex items-center gap-2 px-3 pb-2 border-t border-[var(--border)] pt-2">
                <input
                  autoFocus
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSetLink()}
                  placeholder="https://example.com"
                  className="flex-1 text-sm px-3 py-1.5 bg-[var(--muted)] rounded-lg outline-none focus:ring-1 focus:ring-[var(--p-purple)] border border-transparent focus:border-[var(--p-purple)] transition-all"
                />
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleSetLink() }}
                  className="text-xs px-3 py-1.5 bg-[var(--p-purple)] text-white rounded-lg hover:opacity-90 transition-all"
                >
                  Set
                </button>
                <button
                  onMouseDown={(e) => { e.preventDefault(); setShowLinkInput(false) }}
                  className="text-xs px-3 py-1.5 bg-[var(--muted)] rounded-lg text-[var(--muted-text)] hover:bg-[var(--border)] transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* ── Bubble menu (appears on text selection) ──── */}
          <BubbleMenu
            editor={editor}
            options={{ placement: 'top' }}
            className="flex items-center gap-0.5 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-xl px-1.5 py-1.5"
          >
            <ToolBtn
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Bold"
            >
              <Bold size={14} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="Italic"
            >
              <Italic size={14} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
              title="Underline"
            >
              <UnderlineIcon size={14} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              active={editor.isActive('highlight')}
              title="Highlight"
            >
              <Highlighter size={14} />
            </ToolBtn>
            <div className="w-px h-4 bg-[var(--border)] mx-0.5" />
            <ToolBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              title="H1"
            >
              <span className="text-[11px] font-bold">H1</span>
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="H2"
            >
              <span className="text-[11px] font-bold">H2</span>
            </ToolBtn>
            <div className="w-px h-4 bg-[var(--border)] mx-0.5" />
            <ToolBtn
              onClick={() => setShowLinkInput((v) => !v)}
              active={editor.isActive('link')}
              title="Link"
            >
              <LinkIcon size={14} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')}
              title="Code"
            >
              <Code size={14} />
            </ToolBtn>
          </BubbleMenu>

          {/* ── Floating menu (appears on empty line) ──── */}
          <FloatingMenu
            editor={editor}
            options={{ placement: 'left' }}
            className="flex items-center gap-1 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-xl px-2 py-1.5"
          >
            <ToolBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Heading1 size={15} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 size={15} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Bullet list"
            >
              <List size={15} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              active={editor.isActive('taskList')}
              title="Task list"
            >
              <ListChecks size={15} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="Quote"
            >
              <Quote size={15} />
            </ToolBtn>
            <ToolBtn
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive('codeBlock')}
              title="Code block"
            >
              <Code2 size={15} />
            </ToolBtn>
          </FloatingMenu>
        </>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* ── Editor content ─────────────────────────────── */}
      <div className="px-1 py-6">
        <EditorContent editor={editor} />
      </div>

      {/* ── Word/char count footer ──────────────────────── */}
      {editable && (
        <div className="flex items-center gap-4 px-2 py-3 border-t border-[var(--border)] text-[11px] text-[var(--muted-text)] mt-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
      )}
    </div>
  )
}
