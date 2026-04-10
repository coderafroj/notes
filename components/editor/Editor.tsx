'use client'

import { useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Code,
  Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
}

const MenuButton = ({ 
  onClick, 
  isActive, 
  children 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  children: React.ReactNode 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "p-2 rounded-lg transition-all",
      isActive ? "bg-[var(--p-purple)] text-white shadow-sm" : "text-[var(--muted-text)] hover:bg-[var(--muted)]"
    )}
  >
    {children}
  </button>
)

export default function Editor({ content, onChange, editable = true }: EditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      })
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()))
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[500px] max-w-none dark:prose-invert',
      },
    },
  })

  if (!editor) return null

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
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col w-full h-full">
      {editable && (
        <div className="sticky top-0 z-10 flex items-center gap-1 p-2 bg-[var(--background)] border-b border-[var(--border)] mb-8 flex-wrap">
          <MenuButton 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            isActive={editor.isActive('bold')}
          >
            <Bold size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            isActive={editor.isActive('italic')}
          >
            <Italic size={18} />
          </MenuButton>
          <div className="w-px h-6 bg-[var(--border)] mx-1" />
          <MenuButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
            isActive={editor.isActive('heading', { level: 1 })}
          >
            <Heading1 size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
            isActive={editor.isActive('heading', { level: 2 })}
          >
            <Heading2 size={18} />
          </MenuButton>
          <div className="w-px h-6 bg-[var(--border)] mx-1" />
          <MenuButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            isActive={editor.isActive('bulletList')}
          >
            <List size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()} 
            isActive={editor.isActive('orderedList')}
          >
            <ListOrdered size={18} />
          </MenuButton>
          <div className="w-px h-6 bg-[var(--border)] mx-1" />
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <MenuButton 
            onClick={() => fileInputRef.current?.click()} 
            isActive={editor.isActive('image')}
          >
            <ImageIcon size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
            isActive={editor.isActive('codeBlock')}
          >
            <Code size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleBlockquote().run()} 
            isActive={editor.isActive('blockquote')}
          >
            <Quote size={18} />
          </MenuButton>
        </div>
      )}
      <EditorContent editor={editor} className="flex-1" />
    </div>
  )
}
