// app/[username]/[slug]/page.tsx
// Public note reader — no login needed
// URL: mynotes.bytecores.in/@coderafroj/my-physics-notes

import { getPublicNote } from '@/lib/publish'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar } from 'lucide-react'

interface Props {
  params: Promise<{ username: string; slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { username: rawUsername, slug } = await params
  const username = decodeURIComponent(rawUsername).replace('@', '')
  const note = await getPublicNote(username, slug)
  if (!note) return { title: 'Note not found' }
  return {
    title: `${note.title} — by @${username}`,
    description: note.contentText?.slice(0, 160),
    openGraph: {
      title: note.title,
      description: note.contentText?.slice(0, 160),
      type: 'article',
      authors: [username],
    },
  }
}

// Extract plain text from TipTap JSON for rendering
function renderContent(content: string): string {
  try {
    const json = JSON.parse(content)
    return jsonToHtml(json)
  } catch {
    return `<p>${content}</p>`
  }
}

function jsonToHtml(node: any): string {
  if (!node) return ''
  if (node.type === 'doc') return node.content?.map(jsonToHtml).join('') ?? ''
  if (node.type === 'paragraph') {
    const inner = node.content?.map(jsonToHtml).join('') ?? ''
    return `<p>${inner || '<br>'}</p>`
  }
  if (node.type === 'heading') {
    const l = node.attrs?.level ?? 1
    return `<h${l}>${node.content?.map(jsonToHtml).join('') ?? ''}</h${l}>`
  }
  if (node.type === 'text') {
    let t = node.text ?? ''
    if (node.marks) {
      for (const m of node.marks) {
        if (m.type === 'bold') t = `<strong>${t}</strong>`
        if (m.type === 'italic') t = `<em>${t}</em>`
        if (m.type === 'underline') t = `<u>${t}</u>`
        if (m.type === 'strike') t = `<s>${t}</s>`
        if (m.type === 'code') t = `<code>${t}</code>`
        if (m.type === 'highlight') t = `<mark>${t}</mark>`
        if (m.type === 'link') t = `<a href="${m.attrs?.href}" target="_blank" rel="noopener">${t}</a>`
      }
    }
    return t
  }
  if (node.type === 'bulletList') return `<ul>${node.content?.map(jsonToHtml).join('') ?? ''}</ul>`
  if (node.type === 'orderedList') return `<ol>${node.content?.map(jsonToHtml).join('') ?? ''}</ol>`
  if (node.type === 'listItem') return `<li>${node.content?.map(jsonToHtml).join('') ?? ''}</li>`
  if (node.type === 'taskList') return `<ul class="task-list">${node.content?.map(jsonToHtml).join('') ?? ''}</ul>`
  if (node.type === 'taskItem') {
    const checked = node.attrs?.checked ? 'checked' : ''
    return `<li class="task-item"><input type="checkbox" ${checked} disabled> ${node.content?.map(jsonToHtml).join('') ?? ''}</li>`
  }
  if (node.type === 'blockquote') return `<blockquote>${node.content?.map(jsonToHtml).join('') ?? ''}</blockquote>`
  if (node.type === 'codeBlock') return `<pre><code>${node.content?.map(jsonToHtml).join('') ?? ''}</code></pre>`
  if (node.type === 'horizontalRule') return '<hr>'
  if (node.type === 'image') return `<img src="${node.attrs?.src}" alt="${node.attrs?.alt ?? ''}" style="max-width:100%;border-radius:10px;margin:1rem 0">`
  if (node.content) return node.content.map(jsonToHtml).join('')
  return ''
}

export default async function PublicNotePage({ params }: Props) {
  const { username: rawUsername, slug } = await params
  const username = decodeURIComponent(rawUsername).replace('@', '')
  const note = await getPublicNote(username, slug)

  if (!note) notFound()

  const html = renderContent(note.content)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Top nav */}
      <nav className="sticky top-0 bg-[var(--background)]/90 backdrop-blur border-b border-[var(--border)] z-10">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href={`/@${username}`}
            className="flex items-center gap-2 text-sm text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft size={15} />
            @{username}
          </Link>
          <Link href="/" className="text-sm font-bold text-[var(--p-purple)]">
            Noteflow
          </Link>
        </div>
      </nav>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
          {note.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-[var(--border)]">
          <Link
            href={`/@${username}`}
            className="flex items-center gap-2 hover:text-[var(--p-purple)] transition-colors"
          >
            <img
              src={`https://github.com/${username}.png`}
              alt={username}
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-sm font-medium">@{username}</span>
          </Link>

          <span className="flex items-center gap-1.5 text-xs text-[var(--muted-text)]">
            <Calendar size={12} />
            {formatDate(note.publishedAt || note.updatedAt)}
          </span>

          {note.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 ml-auto">
              {note.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full bg-[var(--muted)] text-xs text-[var(--muted-text)] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className="prose prose-base max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-p:leading-relaxed prose-a:text-[var(--p-purple)] prose-code:bg-[var(--muted)] prose-code:text-[var(--p-purple)] prose-code:px-1 prose-code:rounded prose-blockquote:border-l-[var(--p-purple)] prose-pre:bg-[#1e1e2e] prose-pre:text-[#cdd6f4]"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Footer CTA */}
        <div className="mt-16 pt-8 border-t border-[var(--border)] text-center">
          <p className="text-sm text-[var(--muted-text)] mb-4">
            Written with Noteflow — notes that live in your GitHub
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--p-purple)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all"
          >
            Start writing your own notes →
          </Link>
        </div>
      </article>
    </div>
  )
}
