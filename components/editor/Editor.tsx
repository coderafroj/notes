'use client'

import { useRef, useState, useCallback } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Typography from '@tiptap/extension-typography'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Code,
  Image as ImageIcon,
  CheckSquare,
  Table as TableIcon,
  Link as LinkIcon,
  Highlighter,
  Type
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
}

const ControlButton = ({ 
  onClick, 
  isActive, 
  children,
  title
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  children: React.ReactNode;
  title?: string
}) => (
  <button
    onClick={onClick}
    title={title}
    className={cn(
      "p-2 rounded-lg transition-all",
      isActive 
        ? "bg-[var(--p-purple)]/10 text-[var(--p-purple)] shadow-sm" 
        : "text-[var(--muted-text)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
    )}
  >
    {children}
  </button>
)

export default function Editor({ content, onChange, editable = true }: EditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: 'Enter your thoughts here...',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Highlight,
      Link.configure({
        openOnClick: false,
      }),
      Typography,
    ],
    content: content ? (content.startsWith('{') ? JSON.parse(content) : content) : '',
    editable,
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()))
    },
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none min-h-[500px] w-full max-w-none py-4',
      },
    },
  })

  const addImage = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        editor?.chain().focus().setImage({ src: base64 }).run()
      }
      reader.readAsDataURL(file)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (!editor) return null

  return (
    <div className="flex flex-col w-full h-full group">
      {editable && (
        <>
          {/* Top toolbar */}
          <div className="sticky top-0 z-30 flex items-center gap-0.5 p-1.5 bg-[var(--background)]/80 backdrop-blur-md border border-[var(--border)] rounded-2xl mb-8 flex-wrap premium-shadow">
            <ControlButton 
              onClick={() => editor.chain().focus().toggleBold().run()} 
              isActive={editor.isActive('bold')}
              title="Bold"
            >
              <Bold size={18} />
            </ControlButton>
            <ControlButton 
              onClick={() => editor.chain().focus().toggleItalic().run()} 
              isActive={editor.isActive('italic')}
              title="Italic"
            >
              <Italic size={18} />
            </ControlButton>
            <ControlButton 
              onClick={() => editor.chain().focus().toggleHighlight().run()} 
              isActive={editor.isActive('highlight')}
              title="Highlight"
            >
              <Highlighter size={18} />
            </ControlButton>
            
            <div className="w-px h-6 bg-[var(--border)] mx-1.5" />
            
            <ControlButton 
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Heading1 size={18} />
            </ControlButton>
            <ControlButton 
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 size={18} />
            </ControlButton>
            <ControlButton 
              onClick={() => editor.chain().focus().toggleBlockquote().run()} 
              isActive={editor.isActive('blockquote')}
              title="Quote"
            >
              <Quote size={18} />
            </ControlButton>
            
            <div className="w-px h-6 bg-[var(--border)] mx-1.5" />
            
            <ControlButton 
              onClick={() => editor.chain().focus().toggleBulletList().run()} 
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List size={18} />
            </ControlButton>
            <ControlButton 
              onClick={() => editor.chain().focus().toggleOrderedList().run()} 
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered size={18} />
            </ControlButton>
            <ControlButton 
              onClick={() => editor.chain().focus().toggleTaskList().run()} 
              isActive={editor.isActive('taskList')}
              title="Task List"
            >
              <CheckSquare size={18} />
            </ControlButton>
            
            <div className="w-px h-6 bg-[var(--border)] mx-1.5" />
            
            <ControlButton 
              onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
              isActive={editor.isActive('codeBlock')}
              title="Code Block"
            >
              <Code size={18} />
            </ControlButton>
            <ControlButton 
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} 
              title="Insert Table"
            >
              <TableIcon size={18} />
            </ControlButton>
            <ControlButton 
              onClick={addImage} 
              isActive={editor.isActive('image')}
              title="Insert Image"
            >
              <ImageIcon size={18} />
            </ControlButton>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {/* Bubble Menu */}
          <BubbleMenu 
            editor={editor} 
            tippyOptions={{ duration: 100 }}
            className="flex items-center gap-0.5 p-1 bg-[var(--foreground)] text-[var(--background)] rounded-lg shadow-xl overflow-hidden"
          >
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn("p-1.5 hover:bg-white/10 rounded-md", editor.isActive('bold') && "text-[var(--p-purple)]")}
            >
              <Bold size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn("p-1.5 hover:bg-white/10 rounded-md", editor.isActive('italic') && "text-[var(--p-purple)]")}
            >
              <Italic size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={cn("p-1.5 hover:bg-white/10 rounded-md", editor.isActive('highlight') && "text-[var(--p-purple)]")}
            >
              <Highlighter size={14} />
            </button>
          </BubbleMenu>

          {/* Floating Menu */}
          <FloatingMenu 
            editor={editor} 
            tippyOptions={{ duration: 100 }}
            className="flex flex-col gap-0.5 p-1 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden min-w-[120px]"
          >
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--muted)] text-left"
            >
              <Heading1 size={12} /> Heading 1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--muted)] text-left"
            >
              <Heading2 size={12} /> Heading 2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--muted)] text-left"
            >
              <List size={12} /> Bullet List
            </button>
          </FloatingMenu>
        </>
      )}
      
      <div className={cn("flex-1", !editable && "prose-readonly")}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
