// app/page.tsx — Public homepage
// Shows published notes from community, browse by topic, featured note
// No login needed to view this page

import Link from 'next/link'
import { getPublicIndex } from '@/lib/publish'
import { formatDate } from '@/lib/utils'
import { BookOpen, Github, Wifi, Download, Globe } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────
interface PublicNote {
  id: string
  title: string
  contentPreview: string
  tags: string[]
  slug: string
  publishedAt: string
  updatedAt: string
  author: string
}

// ── Topic config ────────────────────────────────────────────
const TOPICS = [
  { id: 'all',    label: 'All',        emoji: '📚' },
  { id: 'sql',    label: 'SQL',        emoji: '🗄️' },
  { id: 'python', label: 'Python',     emoji: '🐍' },
  { id: 'webdev', label: 'Web Dev',    emoji: '🌐' },
  { id: 'react',  label: 'React',      emoji: '⚛️' },
  { id: 'math',   label: 'Math',       emoji: '📐' },
  { id: 'ai',     label: 'AI / ML',    emoji: '🤖' },
]

// Tag → accent color
const TAG_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  sql:      { bg: '#EEEDFE', text: '#534AB7', dot: '#7F77DD' },
  database: { bg: '#EEEDFE', text: '#534AB7', dot: '#7F77DD' },
  python:   { bg: '#E1F5EE', text: '#0F6E56', dot: '#1D9E75' },
  react:    { bg: '#E6F1FB', text: '#185FA5', dot: '#378ADD' },
  nextjs:   { bg: '#E6F1FB', text: '#185FA5', dot: '#378ADD' },
  math:     { bg: '#FAEEDA', text: '#854F0B', dot: '#EF9F27' },
  css:      { bg: '#FBEAF0', text: '#993556', dot: '#D4537E' },
  webdev:   { bg: '#FBEAF0', text: '#993556', dot: '#D4537E' },
  ai:       { bg: '#EAF3DE', text: '#3B6D11', dot: '#639922' },
  ml:       { bg: '#EAF3DE', text: '#3B6D11', dot: '#639922' },
}

function getColor(tags: string[]) {
  for (const t of tags) {
    if (TAG_COLOR[t]) return TAG_COLOR[t]
  }
  return { bg: '#F1EFE8', text: '#5F5E5A', dot: '#888780' }
}

function readTime(preview: string) {
  const words = preview.split(' ').length * 8 // rough full content estimate
  return Math.max(2, Math.round(words / 200)) + ' min read'
}

function getInitials(login: string) {
  return login.slice(0, 2).toUpperCase()
}

// Avatar colors cycle
const AVATAR_STYLES = [
  { bg: '#EEEDFE', color: '#534AB7' },
  { bg: '#E1F5EE', color: '#0F6E56' },
  { bg: '#E6F1FB', color: '#185FA5' },
  { bg: '#FAEEDA', color: '#854F0B' },
  { bg: '#FBEAF0', color: '#993556' },
]

function avatarStyle(login: string) {
  const idx = login.charCodeAt(0) % AVATAR_STYLES.length
  return AVATAR_STYLES[idx]
}

// ── Fetch all public notes from all known authors ───────────
// In production you'd have a central index; for now we fetch from
// the repo owner's public index. Pass ?author= to filter.
async function getAllPublicNotes(): Promise<PublicNote[]> {
  // Fetch from your own account's public index as seed data
  // Add more usernames as the platform grows
  const authors = ['coderafroj'] // add more authors here as needed
  const all: PublicNote[] = []
  for (const author of authors) {
    try {
      const notes = await getPublicIndex(author)
      for (const n of notes) all.push({ ...n, author })
    } catch {}
  }
  return all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

// ── Page ────────────────────────────────────────────────────
export default async function HomePage() {
  const allNotes = await getAllPublicNotes()
  const featured = allNotes[0]
  const rest = allNotes.slice(1)

  // Topic counts
  const topicCounts: Record<string, number> = { all: allNotes.length }
  for (const note of allNotes) {
    for (const tag of note.tags) {
      topicCounts[tag] = (topicCounts[tag] ?? 0) + 1
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f0f0f' }}>

      {/* ── Navbar ── */}
      <nav style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e5e4df', zIndex: 50, height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#0f0f0f', fontWeight: 700, fontSize: 16 }}>
          <div style={{ width: 28, height: 28, background: '#7F77DD', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>N</div>
          Noteflow
          <span style={{ fontSize: 11, color: '#888780', fontWeight: 400 }}>probanda.tech</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/browse" style={{ padding: '6px 14px', border: '1px solid #e5e4df', borderRadius: 8, fontSize: 13, textDecoration: 'none', color: '#0f0f0f', fontWeight: 500, background: '#fff' }}>Browse notes</Link>
          <Link href="/login" style={{ padding: '6px 14px', border: '1px solid #e5e4df', borderRadius: 8, fontSize: 13, textDecoration: 'none', color: '#0f0f0f', fontWeight: 500, background: '#fff' }}>Sign in</Link>
          <Link href="/login" style={{ padding: '6px 14px', background: '#7F77DD', borderRadius: 8, fontSize: 13, textDecoration: 'none', color: '#fff', fontWeight: 600 }}>Start writing →</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e4df', padding: '56px 24px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 12 }}>
          Learn from real notes,{' '}
          <span style={{ color: '#7F77DD' }}>write your own</span>
        </h1>
        <p style={{ fontSize: 15, color: '#888780', maxWidth: 460, margin: '0 auto 24px', lineHeight: 1.7 }}>
          Community-published notes on SQL, Python, React, Math and more. Read free — no account needed. GitHub users publish. Guests export.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/browse" style={{ padding: '11px 24px', background: '#0f0f0f', color: '#fff', borderRadius: 12, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Browse {allNotes.length} notes</Link>
          <Link href="/login" style={{ padding: '11px 24px', background: 'transparent', border: '1px solid #e5e4df', color: '#0f0f0f', borderRadius: 12, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Start writing →</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'GitHub sync',    bg: '#EEEDFE', color: '#534AB7' },
            { label: 'Works offline',  bg: '#E1F5EE', color: '#0F6E56' },
            { label: 'No login to read', bg: '#FAEEDA', color: '#854F0B' },
            { label: 'Export PDF / MD', bg: '#E6F1FB', color: '#185FA5' },
          ].map((b) => (
            <span key={b.label} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 600, background: b.bg, color: b.color }}>{b.label}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>

        {/* ── Browse by topic ── */}
        <div style={{ background: '#fff', border: '1px solid #e5e4df', borderRadius: 16, padding: 24, marginBottom: 40 }}>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Browse by topic</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {TOPICS.filter((t) => t.id !== 'all').map((topic) => (
              <Link key={topic.id} href={`/browse?topic=${topic.id}`}
                className="border border-[#e5e4df] hover:border-[#7F77DD] hover:bg-[#EEEDFE] transition-all duration-150"
                style={{ padding: '12px 14px', borderRadius: 10, textDecoration: 'none', color: '#0f0f0f', display: 'block' }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{topic.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{topic.label}</div>
                <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>
                  {topicCounts[topic.id] ?? 0} notes
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Featured note ── */}
        {featured && (
          <Link href={`/@${featured.author}/${featured.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: 40 }}>
            <div 
              className="bg-white border border-[#e5e4df] hover:border-[#7F77DD] transition-colors duration-150"
              style={{ borderRadius: 16, padding: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, cursor: 'pointer' }}
            >
              <div>
                <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 10px', borderRadius: 999, background: '#EEEDFE', color: '#534AB7', marginBottom: 12 }}>Featured note</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.3, marginBottom: 8, letterSpacing: '-0.02em' }}>{featured.title}</h2>
                <p style={{ fontSize: 13, color: '#888780', lineHeight: 1.7, marginBottom: 16 }}>{featured.contentPreview}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#7F77DD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                    {getInitials(featured.author)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>@{featured.author}</div>
                    <div style={{ fontSize: 11, color: '#888780' }}>{formatDate(featured.publishedAt)} · {readTime(featured.contentPreview)}</div>
                  </div>
                </div>
              </div>
              <div style={{ background: '#1e1e2e', borderRadius: 10, padding: 18, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8, color: '#cdd6f4', overflow: 'hidden' }}>
                <span style={{ color: '#89b4fa' }}>-- </span><span style={{ color: '#a6e3a1' }}>{featured.title.slice(0, 30)}...</span>{'\n\n'}
                <span style={{ color: '#89dceb' }}>SELECT</span>{' '}*{'\n'}
                <span style={{ color: '#89dceb' }}>FROM</span>{' notes\n'}
                <span style={{ color: '#89dceb' }}>WHERE</span>{' published = '}
                <span style={{ color: '#a6e3a1' }}>true</span>{'\n'}
                <span style={{ color: '#89dceb' }}>ORDER BY</span>{' published_at '}
                <span style={{ color: '#89dceb' }}>DESC</span>{';'}
              </div>
            </div>
          </Link>
        )}

        {/* ── Latest notes grid ── */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Latest notes</p>
            <p style={{ fontSize: 13, color: '#888780', marginTop: 2 }}>Published by the community</p>
          </div>
          <Link href="/browse" style={{ fontSize: 13, color: '#7F77DD', fontWeight: 600, textDecoration: 'none' }}>See all →</Link>
        </div>

        {/* Topic filter pills — client component needed; server-rendered default shows all */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {TOPICS.map((t) => (
            <Link key={t.id} href={t.id === 'all' ? '/browse' : `/browse?topic=${t.id}`}
              style={{ padding: '6px 14px', borderRadius: 999, border: '1px solid #e5e4df', fontSize: 12, fontWeight: 600, textDecoration: 'none', color: '#888780', background: '#fff' }}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* Notes grid */}
        {rest.length === 0 && allNotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#888780' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>📝</p>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No public notes yet</p>
            <p style={{ fontSize: 14 }}>Be the first to publish a note!</p>
            <Link href="/login" style={{ display: 'inline-block', marginTop: 16, padding: '10px 22px', background: '#7F77DD', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Start writing →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 48 }}>
            {(rest.length > 0 ? rest : allNotes).map((note) => {
              const color = getColor(note.tags)
              const av = avatarStyle(note.author)
              return (
                <Link key={`${note.author}-${note.slug}`} href={`/@${note.author}/${note.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div
                    className="bg-white border border-[#e5e4df] hover:border-[#7F77DD] hover:-translate-y-[2px] transition-all duration-150"
                    style={{ borderRadius: 14, padding: 18, cursor: 'pointer', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: color.dot, borderRadius: '14px 0 0 14px' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: color.text }}>
                        {note.tags[0] || 'Note'}
                      </span>
                      <span style={{ fontSize: 10, color: '#888780' }}>· {readTime(note.contentPreview)}</span>
                    </div>

                    <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35, marginBottom: 8, letterSpacing: '-0.01em', flex: 1 }}>{note.title}</h3>

                    <p style={{ fontSize: 13, color: '#888780', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                      {note.contentPreview}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f2f1ed', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: av.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: av.color }}>
                          {getInitials(note.author)}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500 }}>@{note.author}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, color: '#888780' }}>{formatDate(note.publishedAt)}</span>
                        {note.tags.slice(0, 2).map((tag) => (
                          <span key={tag} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 5, background: '#f2f1ed', color: '#888780', fontWeight: 500 }}>#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}

            {/* Write CTA card */}
            <Link href="/login" style={{ textDecoration: 'none', display: 'block' }}>
              <div 
                className="bg-[#f8f8f6] border-[1.5px] border-dashed border-[#e5e4df] hover:border-[#7F77DD] hover:bg-[#EEEDFE20] transition-all duration-150"
                style={{ borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 200, cursor: 'pointer' }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>✏️</div>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Write your own notes</p>
                <p style={{ fontSize: 12, color: '#888780', marginBottom: 14, maxWidth: 160 }}>GitHub users publish free. Guests export PDF or Markdown.</p>
                <span style={{ padding: '6px 16px', background: '#7F77DD', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Start writing →</span>
              </div>
            </Link>
          </div>
        )}

        {/* ── How it works ── */}
        <div style={{ background: '#fff', border: '1px solid #e5e4df', borderRadius: 16, padding: '32px 28px', marginBottom: 40 }}>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>How Noteflow works</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {[
              { icon: '📖', title: 'Read for free', desc: 'Browse and read any public note without creating an account.' },
              { icon: '🔑', title: 'GitHub login', desc: 'Sign in with GitHub. Notes save to your private repo automatically.' },
              { icon: '👤', title: 'Guest mode', desc: 'No GitHub? Write notes locally and export as PDF or Markdown.' },
              { icon: '🌍', title: 'Publish publicly', desc: 'One tap to publish. Students can read at probanda.tech/@you/note-title.' },
            ].map((item) => (
              <div key={item.title} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.title}</p>
                <p style={{ fontSize: 12, color: '#888780', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ textAlign: 'center', paddingBottom: 40, color: '#888780', fontSize: 13 }}>
          <p style={{ marginBottom: 8 }}>Built with Noteflow · <a href="https://probanda.tech" style={{ color: '#7F77DD', textDecoration: 'none' }}>probanda.tech</a></p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Link href="/browse" style={{ color: '#888780', textDecoration: 'none', fontSize: 12 }}>Browse notes</Link>
            <Link href="/login" style={{ color: '#888780', textDecoration: 'none', fontSize: 12 }}>Start writing</Link>
            <a href="https://github.com/coderafroj/notes" target="_blank" rel="noopener" style={{ color: '#888780', textDecoration: 'none', fontSize: 12 }}>GitHub</a>
          </div>
        </div>

      </div>
    </div>
  )
}
