import Link from 'next/link'
import { getGlobalFeed } from '@/lib/publish'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { formatDate } from '@/lib/utils'

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

// ── Page ────────────────────────────────────────────────────
export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const allNotes = await getGlobalFeed(session?.user?.login)
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
    <div className="min-h-screen bg-[#f8f8f6] font-sans text-[#0f0f0f]">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-[#e5e4df] z-50 h-14 md:h-16 flex items-center px-4 md:px-8 justify-between">
        <Link href="/" className="flex items-center gap-2 md:gap-3 outline-none active:scale-95 transition-transform">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-[#7F77DD] rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-sm">N</div>
          <span className="font-bold text-base md:text-lg">Noteflow</span>
          <span className="hidden sm:block text-[11px] text-[#888780] tracking-wide mt-1">probanda.tech</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/browse" className="hidden sm:flex px-3 py-1.5 md:px-4 md:py-2 border border-[#e5e4df] rounded-lg md:rounded-xl text-[13px] md:text-sm font-semibold bg-white hover:bg-[#f8f8f6] active:scale-95 transition-all">Browse</Link>
          <Link href="/login" className="px-3 py-1.5 md:px-4 md:py-2 border border-[#e5e4df] rounded-lg md:rounded-xl text-[13px] md:text-sm font-semibold bg-white hover:bg-[#f8f8f6] active:scale-95 transition-all">Sign in</Link>
          <Link href="/login" className="px-3 py-1.5 md:px-4 md:py-2 bg-[#7F77DD] text-white rounded-lg md:rounded-xl text-[13px] md:text-sm font-bold shadow-md hover:bg-[#6b62cf] hover:shadow-lg active:scale-95 transition-all">Write <span className="hidden sm:inline">→</span></Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="bg-white border-b border-[#e5e4df] px-4 py-12 md:py-24 text-center flex flex-col items-center justify-center">
        <h1 className="text-[32px] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-5 max-w-4xl">
          Learn from real notes,<br className="sm:hidden" />{' '}
          <span className="text-[#7F77DD]">write your own</span>
        </h1>
        <p className="text-[15px] md:text-[17px] text-[#888780] max-w-[500px] mb-8 leading-relaxed px-2">
          Community-published notes on SQL, Python, React, Math and more. Read free — no account needed. GitHub users publish. Guests export.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-4 sm:px-0">
          <Link href="/browse" className="w-full sm:w-auto px-6 py-3.5 bg-[#0f0f0f] text-white rounded-xl font-bold text-[15px] shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all">Browse {allNotes.length} notes</Link>
          <Link href="/login" className="w-full sm:w-auto px-6 py-3.5 bg-transparent border border-[#e5e4df] text-[#0f0f0f] rounded-xl font-bold text-[15px] hover:bg-[#f8f8f6] active:scale-95 transition-all">Start writing →</Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 max-w-[280px] sm:max-w-xl">
          {[
            { label: 'GitHub sync',    bg: '#EEEDFE', color: '#534AB7' },
            { label: 'Works offline',  bg: '#E1F5EE', color: '#0F6E56' },
            { label: 'No login to read', bg: '#FAEEDA', color: '#854F0B' },
            { label: 'Export PDF / MD', bg: '#E6F1FB', color: '#185FA5' },
          ].map((b) => (
            <span key={b.label} className="text-[10px] md:text-[11px] px-3 py-1 md:py-1.5 rounded-full font-bold shadow-sm" style={{ background: b.bg, color: b.color }}>{b.label}</span>
          ))}
        </div>
      </div>

      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">

        {/* ── Browse by topic ── */}
        <div className="bg-white border border-[#e5e4df] rounded-2xl md:rounded-[24px] p-5 md:p-8 mb-10 shadow-sm">
          <p className="text-[15px] md:text-[17px] font-bold mb-4">Browse by topic</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {TOPICS.filter((t) => t.id !== 'all').map((topic) => (
              <Link key={topic.id} href={`/browse?topic=${topic.id}`}
                className="group border border-[#e5e4df] hover:border-[#7F77DD] hover:bg-[#EEEDFE] active:scale-95 p-3 md:p-4 rounded-xl md:rounded-[16px] transition-all duration-200 block shadow-sm hover:shadow-md"
              >
                <div className="text-2xl md:text-3xl mb-1.5 md:mb-2 group-hover:scale-110 transition-transform origin-left">{topic.emoji}</div>
                <div className="text-[13px] md:text-[15px] font-bold text-[#0f0f0f] leading-tight">{topic.label}</div>
                <div className="text-[11px] md:text-xs text-[#888780] mt-1 font-medium">{topicCounts[topic.id] ?? 0} notes</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Featured note ── */}
        {featured && (
          <Link href={`/@${featured.author}/${featured.slug}`} className="block mb-10 group active:scale-[0.98] transition-transform">
            <div className="bg-white border border-[#e5e4df] group-hover:border-[#7F77DD] group-hover:shadow-lg rounded-2xl md:rounded-[24px] p-5 md:p-8 grid lg:grid-cols-2 gap-6 md:gap-10 transition-all duration-300">
              <div className="flex flex-col justify-center">
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-[#EEEDFE] text-[#534AB7] mb-4 w-max">Featured note</span>
                <h2 className="text-xl md:text-[26px] font-extrabold leading-[1.2] mb-3 tracking-tight group-hover:text-[#7F77DD] transition-colors">{featured.title}</h2>
                <p className="text-[14px] md:text-[15px] text-[#888780] leading-[1.7] mb-6 line-clamp-3 md:line-clamp-none">{featured.contentPreview}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#7F77DD] flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {getInitials(featured.author)}
                  </div>
                  <div>
                    <div className="text-[13px] md:text-[14px] font-bold">@{featured.author}</div>
                    <div className="text-[11px] md:text-[12px] text-[#888780] font-medium">{formatDate(featured.publishedAt)} · {readTime(featured.contentPreview)}</div>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block bg-[#1e1e2e] rounded-[16px] p-6 font-mono text-[13px] leading-[1.8] text-[#cdd6f4] overflow-hidden shadow-inner">
                <span className="text-[#89b4fa]">-- </span><span className="text-[#a6e3a1]">{featured.title.slice(0, 30)}...</span>{'\n\n'}
                <span className="text-[#89dceb]">SELECT</span> *{'\n'}
                <span className="text-[#89dceb]">FROM</span> notes{'\n'}
                <span className="text-[#89dceb]">WHERE</span> published = <span className="text-[#a6e3a1]">true</span>{'\n'}
                <span className="text-[#89dceb]">ORDER BY</span> published_at <span className="text-[#89dceb]">DESC</span>;
              </div>
            </div>
          </Link>
        )}

        {/* ── Latest notes grid ── */}
        <div className="flex items-end justify-between mb-5 px-1">
          <div>
            <p className="text-lg md:text-[22px] font-extrabold tracking-tight">Latest notes</p>
            <p className="text-[13px] text-[#888780] mt-0.5 font-medium">Published by the community</p>
          </div>
          <Link href="/browse" className="text-[13px] text-[#7F77DD] font-bold hover:underline active:scale-95 transition-transform">See all →</Link>
        </div>

        {/* Topic filter pills */}
        <div className="flex flex-wrap gap-2 mb-6 px-1">
          {TOPICS.map((t) => (
            <Link key={t.id} href={t.id === 'all' ? '/browse' : `/browse?topic=${t.id}`}
              className="px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-[#e5e4df] text-[12px] font-semibold text-[#888780] bg-white hover:bg-[#EEEDFE] hover:text-[#534AB7] hover:border-[#7F77DD] active:scale-95 transition-all shadow-sm"
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* Notes grid */}
        {rest.length === 0 && allNotes.length === 0 ? (
          <div className="text-center py-20 text-[#888780]">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-lg font-bold mb-2">No public notes yet</p>
            <p className="text-sm">Be the first to publish a note!</p>
            <Link href="/login" className="inline-block mt-6 px-6 py-3 bg-[#7F77DD] text-white rounded-xl font-bold shadow-md hover:bg-[#6b62cf] transition-colors active:scale-95">Start writing →</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-16">
            {(rest.length > 0 ? rest : allNotes).map((note) => {
              const color = getColor(note.tags)
              const av = avatarStyle(note.author)
              return (
                <Link key={`${note.author}-${note.slug}`} href={`/@${note.author}/${note.slug}`} className="block group active:scale-[0.98] transition-transform">
                  <div className="bg-white border border-[#e5e4df] group-hover:border-[#7F77DD] group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-200 rounded-[18px] p-5 md:p-6 relative overflow-hidden flex flex-col h-full min-h-[220px]">
                    <div className="absolute top-0 left-0 w-1 h-full rounded-l-[18px]" style={{ background: color.dot }} />
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md" style={{ color: color.text, background: color.bg }}>
                        {note.tags[0] || 'Note'}
                      </span>
                      <span className="text-[10px] text-[#888780] font-medium">· {readTime(note.contentPreview)}</span>
                    </div>
                    <h3 className="text-[15px] md:text-[17px] font-bold leading-[1.3] mb-3 group-hover:text-[#7F77DD] transition-colors">{note.title}</h3>
                    <p className="text-[13px] md:text-[14px] text-[#888780] leading-[1.6] line-clamp-2 md:line-clamp-3 mb-4 flex-1">
                      {note.contentPreview}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-[#f2f1ed] mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold" style={{ background: av.bg, color: av.color }}>
                          {getInitials(note.author)}
                        </div>
                        <span className="text-[12px] font-bold">@{note.author}</span>
                      </div>
                      <span className="text-[11px] font-medium text-[#888780]">{formatDate(note.publishedAt)}</span>
                    </div>
                  </div>
                </Link>
              )
            })}

            {/* Write CTA card */}
            <Link href="/login" className="block active:scale-[0.98] transition-transform">
              <div className="bg-[#f8f8f6] border-2 border-dashed border-[#e5e4df] hover:border-[#7F77DD] hover:bg-[#EEEDFE]/30 transition-all duration-200 rounded-[18px] p-6 flex flex-col items-center justify-center text-center h-full min-h-[220px]">
                <div className="text-3xl mb-3">✏️</div>
                <p className="text-[15px] font-bold mb-1">Write your own notes</p>
                <p className="text-[12px] text-[#888780] mb-4 max-w-[180px] font-medium">GitHub users publish free. Guests export locally.</p>
                <span className="px-5 py-2 bg-[#7F77DD] text-white rounded-xl text-[12px] font-bold shadow-sm">Start writing →</span>
              </div>
            </Link>
          </div>
        )}

        {/* ── How it works ── */}
        <div className="bg-white border border-[#e5e4df] rounded-[24px] p-6 md:p-10 mb-12 shadow-sm">
          <p className="text-[17px] md:text-[20px] font-extrabold mb-8 text-center">How Noteflow works</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: '📖', title: 'Read for free', desc: 'Browse and read any public note without creating an account.' },
              { icon: '🔑', title: 'GitHub login', desc: 'Sign in with GitHub. Notes save to your private repo automatically.' },
              { icon: '👤', title: 'Guest mode', desc: 'No GitHub? Write notes locally and export as PDF or Markdown.' },
              { icon: '🌍', title: 'Publish publicly', desc: 'One tap to publish. Students can read at probanda.tech/@you.' },
            ].map((item) => (
              <div key={item.title} className="text-center group">
                <div className="text-3xl md:text-4xl mb-3 group-hover:scale-110 transition-transform origin-center">{item.icon}</div>
                <p className="text-[14px] font-bold mb-1.5">{item.title}</p>
                <p className="text-[13px] text-[#888780] leading-relaxed px-2 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="text-center pb-10 text-[#888780] text-[13px] font-medium">
          <p className="mb-3">Built with Noteflow · <a href="https://probanda.tech" className="text-[#7F77DD] font-bold hover:underline">probanda.tech</a></p>
          <div className="flex items-center justify-center gap-5">
            <Link href="/browse" className="hover:text-[#0f0f0f] transition-colors">Browse notes</Link>
            <Link href="/login" className="hover:text-[#0f0f0f] transition-colors">Start writing</Link>
            <a href="https://github.com/coderafroj/notes" target="_blank" rel="noopener" className="hover:text-[#0f0f0f] transition-colors">GitHub</a>
          </div>
        </div>

      </div>
    </div>
  )
}
