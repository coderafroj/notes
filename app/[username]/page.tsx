// app/[username]/page.tsx
// Public profile page — no login needed
// URL: mynotes.bytecores.in/@coderafroj
// Shows all published notes of a user

import { getPublicIndex } from '@/lib/publish'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { BookOpen, Tag, Calendar } from 'lucide-react'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  return {
    title: `@${username} — Noteflow`,
    description: `Public notes by ${username}`,
  }
}

export default async function AuthorProfilePage({ params }: Props) {
  const { username: rawUsername } = await params
  const username = rawUsername.replace('%40', '').replace('@', '')
  const notes = await getPublicIndex(username)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-[var(--background)]">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={`https://github.com/${username}.png`}
              alt={username}
              width={72}
              height={72}
              className="rounded-2xl border border-[var(--border)]"
            />
            <div>
              <h1 className="text-2xl font-bold">@{username}</h1>
              <p className="text-[var(--muted-text)] text-sm mt-1">
                {notes.length} public note{notes.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-[var(--muted-text)] hover:text-[var(--p-purple)] transition-colors"
            >
              <span className="text-lg font-bold text-[var(--p-purple)]">N</span>
              Noteflow
            </Link>
          </div>
        </div>
      </div>

      {/* Notes list */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        {notes.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen
              size={48}
              className="mx-auto mb-4 text-[var(--muted-text)] opacity-30"
            />
            <p className="text-[var(--muted-text)]">No public notes yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notes.map((note: any) => (
              <Link
                key={note.slug}
                href={`/@${username}/${note.slug}`}
                className="group block p-5 rounded-2xl border border-[var(--border)] hover:border-[var(--p-purple)] hover:bg-[var(--p-purple)]/5 transition-all"
              >
                <h2 className="text-lg font-bold mb-2 group-hover:text-[var(--p-purple)] transition-colors">
                  {note.title}
                </h2>

                {note.contentPreview && (
                  <p className="text-sm text-[var(--muted-text)] line-clamp-2 mb-3">
                    {note.contentPreview}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-[var(--muted-text)]">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {formatDate(note.publishedAt || note.updatedAt)}
                  </span>
                  {note.tags?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Tag size={11} />
                      {note.tags.slice(0, 3).join(', ')}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
