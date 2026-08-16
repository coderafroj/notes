'use client'

// ============================================================
// components/editor/Editor.tsx — Advanced Production Editor
// Features: floating toolbar, slash commands, task lists,
// highlight, table, mobile-friendly, keyboard shortcuts
// ============================================================

import { useRef, useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import TextAlign from '@tiptap/extension-text-align'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { SlashCommands, getSuggestionItems, renderItems } from './SlashCommands'
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
  Palette,
  ChevronDown,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
  color?: string | null
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
      'flex items-center justify-center min-w-[36px] min-h-[36px] md:w-9 md:h-9 rounded-xl transition-all text-sm shrink-0 active:scale-90',
      active
        ? 'bg-[#7F77DD] text-white shadow-md'
        : 'text-[#888780] hover:bg-[#f2f1ed] hover:text-[#0f0f0f]',
      className
    )}
  >
    {children}
  </button>
)

const Divider = () => (
  <div className="w-[1.5px] h-6 bg-[#e5e4df] mx-1 md:mx-2 shrink-0 self-center opacity-50" />
)

export default function Editor({
  content,
  onChange,
  editable = true,
  color = null,
}: EditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlighterPicker, setShowHighlighterPicker] = useState(false)

  const PRESET_COLORS = [
    { name: 'Default', color: 'inherit' },
    { name: 'Purple', color: '#7F77DD' },
    { name: 'Teal', color: '#1D9E75' },
    { name: 'Blue', color: '#378ADD' },
    { name: 'Red', color: '#E24B4A' },
    { name: 'Amber', color: '#EF9F27' },
    { name: 'Pink', color: '#D4537E' },
  ]

  const HIGHLIGHT_COLORS = [
    { name: 'Yellow', color: '#fef08a' },
    { name: 'Green', color: '#bbf7d0' },
    { name: 'Blue', color: '#bfdbfe' },
    { name: 'Purple', color: '#e9d5ff' },
    { name: 'Red', color: '#fecaca' },
    { name: 'Orange', color: '#fed7aa' },
  ]

  const getBgColor = () => {
    switch (color) {
      case 'purple': return 'rgba(127, 119, 221, 0.03)'
      case 'teal': return 'rgba(29, 158, 117, 0.03)'
      case 'amber': return 'rgba(239, 159, 39, 0.03)'
      case 'blue': return 'rgba(55, 138, 221, 0.03)'
      case 'red': return 'rgba(226, 75, 74, 0.03)'
      case 'green': return 'rgba(99, 153, 34, 0.03)'
      default: return 'transparent'
    }
  }


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: {},
      }),
      TextStyle,
      FontFamily,
      Color,
      Image.configure({ inline: true, allowBase64: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Underline,
      Subscript,
      Superscript,
      Link.configure({ openOnClick: false, autolink: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return 'Heading...'
          return "Start writing, use '/' for commands..."
        },
      }),
      CharacterCount,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      SlashCommands.configure({
        suggestion: {
          items: getSuggestionItems,
          render: renderItems,
        },
      }),
    ],
    immediatelyRender: false,
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
          'prose prose-base md:prose-lg max-w-none focus:outline-none min-h-[60vh] text-[#0f0f0f] dark:text-[#f8f8f6] prose-headings:font-black prose-h1:text-5xl prose-h1:leading-[1.1] md:prose-h1:text-6xl prose-h2:text-3xl md:prose-h2:text-4xl prose-h3:text-2xl md:prose-h3:text-3xl prose-p:leading-[1.7] prose-p:text-[17px] prose-p:mb-6 prose-li:leading-[1.7] prose-code:text-[#7F77DD] prose-code:bg-[#7F77DD]/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-blockquote:border-l-4 prose-blockquote:border-[#7F77DD] prose-blockquote:bg-[#7F77DD]/5 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-2xl',
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
  }, [content, editor])

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
    <div
      className="flex flex-col w-full max-w-full transition-colors duration-500 rounded-[32px] overflow-visible relative"
      style={{ backgroundColor: getBgColor() }}
    >

      {editable && (
        <>
          {/* ── Main toolbar ───────────────────────────────── */}
          <div className="sticky top-0 z-30 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl border-b border-[#e5e4df] dark:border-white/5 max-w-full rounded-t-[32px]">
            {/* Row 1 — Fluid Touch Toolbar */}
            <div className="flex items-center gap-1 px-4 py-2.5 flex-wrap overflow-visible max-w-full">
              {/* History */}
              <div className="flex items-center gap-1 mr-1">
                <ToolBtn
                  onClick={() => editor.chain().focus().undo().run()}
                  title="Undo"
                >
                  <Undo size={17} />
                </ToolBtn>
                <ToolBtn
                  onClick={() => editor.chain().focus().redo().run()}
                  title="Redo"
                >
                  <Redo size={17} />
                </ToolBtn>
              </div>

              <Divider />

              {/* Headings & Font */}
              <div className="flex items-center gap-1">
                <select
                  onChange={(e) => {
                    if (e.target.value === '') {
                      editor.chain().focus().unsetFontFamily().run()
                    } else {
                      editor.chain().focus().setFontFamily(e.target.value).run()
                    }
                  }}
                  className="bg-transparent text-[13px] font-medium outline-none text-[#0f0f0f] dark:text-white w-24 mr-2 hidden md:block"
                  defaultValue=""
                >
                  <option value="">Default Font</option>
                  <option value="Inter">Inter</option>
                  <option value="Comic Sans MS, Comic Sans">Comic Sans</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                </select>
                <ToolBtn
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  active={editor.isActive('paragraph')}
                  title="Text"
                >
                  <Type size={17} />
                </ToolBtn>
                <ToolBtn
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  active={editor.isActive('heading', { level: 1 })}
                  title="H1"
                >
                  <Heading1 size={17} />
                </ToolBtn>
                <ToolBtn
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  active={editor.isActive('heading', { level: 2 })}
                  title="H2"
                >
                  <Heading2 size={17} />
                </ToolBtn>
              </div>

              <Divider />

              {/* Formatting */}
              <div className="flex items-center gap-1">
                <ToolBtn
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  active={editor.isActive('bold')}
                  title="Bold"
                >
                  <Bold size={17} strokeWidth={3} />
                </ToolBtn>
                <ToolBtn
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  active={editor.isActive('italic')}
                  title="Italic"
                >
                  <Italic size={17} strokeWidth={2.5} />
                </ToolBtn>
                <ToolBtn
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  active={editor.isActive('underline')}
                >
                  <UnderlineIcon size={17} strokeWidth={2.5} />
                </ToolBtn>
                
                <div className="relative">
                  <ToolBtn
                    onClick={() => {
                      setShowHighlighterPicker(!showHighlighterPicker)
                      setShowColorPicker(false)
                    }}
                    active={editor.isActive('highlight')}
                  >
                    <div className="flex items-center">
                      <Highlighter size={16} />
                      <ChevronDown size={10} className="ml-0.5 opacity-50" />
                    </div>
                  </ToolBtn>
                  {showHighlighterPicker && (
                    <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-[#e5e4df] rounded-[20px] shadow-2xl z-50 grid grid-cols-4 gap-2 w-max">
                      <button
                        onClick={() => {
                          editor.chain().focus().unsetHighlight().run()
                          setShowHighlighterPicker(false)
                        }}
                        className="col-span-4 text-[10px] font-black uppercase py-2 bg-[#f2f1ed] rounded-xl"
                      >
                        Reset Highlight
                      </button>
                      {HIGHLIGHT_COLORS.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => {
                            editor.chain().focus().toggleHighlight({ color: c.color }).run()
                            setShowHighlighterPicker(false)
                          }}
                          className="w-8 h-8 rounded-full border border-[#e5e4df] hover:scale-110 transition-transform active:scale-90"
                          style={{ backgroundColor: c.color }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Divider />

              {/* Extras */}
              <div className="flex items-center gap-1">
                <ToolBtn
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  active={editor.isActive('bulletList')}
                >
                  <List size={17} />
                </ToolBtn>
                <ToolBtn
                  onClick={() => editor.chain().focus().toggleTaskList().run()}
                  active={editor.isActive('taskList')}
                >
                  <ListChecks size={17} />
                </ToolBtn>
                <ToolBtn
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  active={editor.isActive('blockquote')}
                >
                  <Quote size={17} />
                </ToolBtn>
                <ToolBtn
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  active={editor.isActive('codeBlock')}
                >
                  <Code2 size={17} />
                </ToolBtn>
                <ToolBtn
                  onClick={() => setShowLinkInput(v => !v)}
                  active={editor.isActive('link')}
                >
                  <LinkIcon size={17} />
                </ToolBtn>
                <ToolBtn
                  onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                  title="Insert Table"
                >
                  <TableIcon size={17} />
                </ToolBtn>
                {editor.isActive('table') && (
                  <div className="flex items-center bg-[#f2f1ed] dark:bg-white/10 rounded-xl px-1 gap-1 ml-1">
                    <ToolBtn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column">+</ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row">▤</ToolBtn>
                    <ToolBtn onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table" className="text-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></ToolBtn>
                  </div>
                )}
                <ToolBtn
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon size={17} />
                </ToolBtn>
              </div>
            </div>

            {/* Link input bar */}
            {showLinkInput && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 pb-3 border-t border-[#e5e4df] pt-3"
              >
                <input
                  autoFocus
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSetLink()}
                  placeholder="Paste URL..."
                  className="flex-1 text-[14px] px-4 py-2.5 bg-[#f2f1ed] rounded-xl outline-none focus:ring-4 focus:ring-[#7F77DD]/10 border border-transparent focus:border-[#7F77DD] transition-all font-medium"
                />
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleSetLink() }}
                  className="px-6 py-2.5 bg-[#7F77DD] text-white rounded-xl font-bold text-xs"
                >
                  Save
                </button>
              </motion.div>
            )}
          </div>

          {/* Selection Bubble Menu */}
          <BubbleMenu
            editor={editor}
            className="flex items-center gap-1 bg-[#1a1a1a] text-white rounded-[20px] shadow-2xl px-2 py-2 border border-white/10"
          >
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={cn("p-2 rounded-xl", editor.isActive('bold') && "bg-white/10")}><Bold size={15} /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={cn("p-2 rounded-xl", editor.isActive('italic') && "bg-white/10")}><Italic size={15} /></button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn("p-2 rounded-xl", editor.isActive('heading') && "bg-white/10")}><span className="text-[11px] font-black">H2</span></button>
          </BubbleMenu>
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
      <div className="px-5 md:px-10 lg:px-20 py-10">
        <EditorContent editor={editor} />
      </div>

      {/* ── Footer ──────────────────────── */}
      {editable && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e4df] dark:border-white/5 bg-[#f8f8f6]/50 dark:bg-white/5 rounded-b-[32px]">
          <div className="flex gap-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#888780]">
            <span>{wordCount} Words</span>
            <span className="opacity-40">/</span>
            <span>{charCount} Chars</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-tighter text-[#7F77DD] bg-[#7F77DD]/10 px-2.5 py-1 rounded-full">
            Shell Active
          </div>
        </div>
      )}
    </div>
  )
}
