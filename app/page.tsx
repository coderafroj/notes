import Link from 'next/link'
import { getGlobalFeed } from '@/lib/publish'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { formatDate } from '@/lib/utils'

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

const TOPICS = [
  { id: 'all',    label: 'All',        emoji: '📚', color: 'from-[#7F77DD] to-[#9F97ED]' },
  { id: 'sql',    label: 'SQL',        emoji: '🗄️', color: 'from-[#534AB7] to-[#7F77DD]' },
  { id: 'python', label: 'Python',     emoji: '🐍', color: 'from-[#0F6E56] to-[#1D9E75]' },
  { id: 'webdev', label: 'Web Dev',    emoji: '🌐', color: 'from-[#993556] to-[#D4537E]' },
  { id: 'react',  label: 'React',      emoji: '⚛️', color: 'from-[#185FA5] to-[#378ADD]' },
  { id: 'math',   label: 'Math',       emoji: '📐', color: 'from-[#854F0B] to-[#EF9F27]' },
  { id: 'ai',     label: 'AI / ML',    emoji: '🤖', color: 'from-[#3B6D11] to-[#639922]' },
]

function readTime(preview: string) {
  const words = preview.split(' ').length * 8
  return Math.max(2, Math.round(words / 200)) + ' min'
}

function getInitials(login: string) {
  return login.slice(0, 2).toUpperCase()
}

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

import { Suspense } from 'react'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-[#fbfbfc] dark:bg-[#09090b] font-sans text-[#0c0c0e] dark:text-[#fafafa] selection:bg-[#7F77DD]/30">
      
      {/* ── Navbar ── */}
      <nav className="sticky top-0 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-black/5 dark:border-white/5 z-50 h-16 flex items-center px-6 justify-between">
        <Link href="/" className="flex items-center gap-3 outline-none hover:scale-105 active:scale-95 transition-transform duration-300">
          <div className="w-8 h-8 bg-gradient-to-br from-[#7F77DD] to-[#534AB7] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#7F77DD]/30">N</div>
          <span className="font-extrabold text-lg tracking-tight">Noteflow</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/browse" className="hidden sm:flex px-4 py-2 text-sm font-semibold text-[#6b7280] hover:text-[#0c0c0e] dark:text-[#a1a1aa] dark:hover:text-white transition-colors">Browse</Link>
          <Link href="/login" className="hidden sm:flex px-4 py-2 text-sm font-semibold text-[#6b7280] hover:text-[#0c0c0e] dark:text-[#a1a1aa] dark:hover:text-white transition-colors">Sign in</Link>
          <Link href="/login" className="px-5 py-2.5 bg-gradient-to-r from-[#7F77DD] to-[#9F97ED] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#7F77DD]/30 hover:shadow-[#7F77DD]/50 hover:-translate-y-0.5 active:scale-95 transition-all">Start Writing</Link>
        </div>
      </nav>

      {/* ── Cinematic Hero ── */}
      <div className="relative overflow-hidden bg-white dark:bg-[#09090b] border-b border-black/5 dark:border-white/5 pt-24 pb-32 flex flex-col items-center justify-center text-center px-4">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#7F77DD]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1D9E75]/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEEDFE] dark:bg-[#7F77DD]/10 text-[#534AB7] dark:text-[#9F97ED] text-xs font-bold mb-8 uppercase tracking-widest border border-[#7F77DD]/20">
          <span className="w-2 h-2 rounded-full bg-[#534AB7] dark:bg-[#9F97ED] animate-pulse" /> Global Publishing Live
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-black tracking-tighter leading-[1.05] mb-6 max-w-5xl text-transparent bg-clip-text bg-gradient-to-b from-[#0c0c0e] to-[#6b7280] dark:from-white dark:to-[#a1a1aa]">
          Thoughts that scale.<br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7F77DD] to-[#1D9E75]">Without limits.</span>
        </h1>
        
        <p className="text-[17px] md:text-xl text-[#6b7280] dark:text-[#a1a1aa] max-w-[600px] mb-12 leading-relaxed font-medium">
          A high-performance markdown editor backed entirely by your GitHub. Write offline, sync instantly, and publish to the world in a single click.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-[#0c0c0e] dark:bg-white text-white dark:text-black rounded-2xl font-bold text-[16px] shadow-2xl hover:shadow-3xl hover:-translate-y-1 active:scale-95 transition-all">Start creating for free</Link>
          <Link href="/browse" className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-black/10 dark:border-white/10 text-[#0c0c0e] dark:text-white rounded-2xl font-bold text-[16px] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all">Explore community notes</Link>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 -mt-16">
        <Suspense fallback={<FeedSkeleton />}>
          <GlobalFeed currentUser={session?.user?.login} />
        </Suspense>
      </div>
    </div>
  )
}

async function GlobalFeed({ currentUser }: { currentUser?: string | null }) {
  const allNotes = await getGlobalFeed(currentUser)
  const featured = allNotes[0]
  const rest = allNotes.slice(1)

  const topicCounts: Record<string, number> = { all: allNotes.length }
  for (const note of allNotes) {
    for (const tag of note.tags) {
      topicCounts[tag] = (topicCounts[tag] ?? 0) + 1
    }
  }

  return (
    <>
        {/* ── Featured Note Showcase ── */}
        {featured && (
          <Link href={`/@${featured.author}/${featured.slug}`} className="block mb-16 group active:scale-[0.98] transition-transform duration-500">
            <div className="bg-white/80 dark:bg-[#111114]/80 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-[32px] overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/50 hover:shadow-[#7F77DD]/20 transition-all duration-500">
              <div className="grid lg:grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 rounded-full bg-[#EEEDFE] dark:bg-[#7F77DD]/20 text-[#534AB7] dark:text-[#9F97ED] text-xs font-black uppercase tracking-widest">Featured</span>
                    <span className="text-xs font-medium text-[#6b7280] dark:text-[#a1a1aa]">{formatDate(featured.publishedAt)}</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black leading-[1.1] mb-4 tracking-tight group-hover:text-[#7F77DD] transition-colors">{featured.title}</h2>
                  <p className="text-[16px] md:text-lg text-[#6b7280] dark:text-[#a1a1aa] leading-relaxed mb-8 line-clamp-3">{featured.contentPreview}</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md" style={{ background: avatarStyle(featured.author).bg, color: avatarStyle(featured.author).color }}>
                      {getInitials(featured.author)}
                    </div>
                    <div>
                      <div className="text-[15px] font-bold dark:text-white">@{featured.author}</div>
                      <div className="text-[13px] text-[#6b7280] dark:text-[#a1a1aa] font-medium">{readTime(featured.contentPreview)} read</div>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-[#7F77DD]/10 to-[#1D9E75]/10 p-12">
                  <div className="w-full h-full max-h-[300px] bg-[#0d1117] rounded-2xl shadow-2xl p-6 font-mono text-sm leading-relaxed text-[#e6edf3] overflow-hidden border border-white/10 relative">
                    <div className="absolute top-0 left-0 w-full h-8 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="pt-8">
                      <span className="text-[#8b949e]"># {featured.title}</span><br/><br/>
                      <span className="text-[#ff7b72]">export</span> <span className="text-[#ff7b72]">const</span> <span className="text-[#79c0ff]">note</span> <span className="text-[#ff7b72]">=</span> <span className="text-[#a5d6ff]">{'{'}</span><br/>
                      &nbsp;&nbsp;author: <span className="text-[#a5d6ff]">'@{featured.author}'</span>,<br/>
                      &nbsp;&nbsp;tags: [<span className="text-[#a5d6ff]">{featured.tags.map((t: string) => `'${t}'`).join(', ')}</span>]<br/>
                      <span className="text-[#a5d6ff]">{'}'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h3 className="text-3xl font-black tracking-tight mb-2">Global Feed</h3>
            <p className="text-[15px] text-[#6b7280] dark:text-[#a1a1aa] font-medium">Discover thoughts published directly from personal GitHub repos.</p>
          </div>
          <Link href="/browse" className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#111114] border border-black/5 dark:border-white/10 text-sm font-bold shadow-sm hover:shadow-md active:scale-95 transition-all">
            View All →
          </Link>
        </div>

        {/* ── Topic Filter Pills ── */}
        <div className="flex flex-wrap gap-2 mb-10">
          {TOPICS.map((t) => (
            <Link key={t.id} href={t.id === 'all' ? '/browse' : `/browse?topic=${t.id}`}
              className="px-5 py-2 rounded-full border border-black/5 dark:border-white/10 text-[14px] font-semibold bg-white dark:bg-[#111114] hover:border-[#7F77DD] hover:text-[#7F77DD] active:scale-95 transition-all shadow-sm flex items-center gap-2"
            >
              <span>{t.emoji}</span> {t.label} <span className="opacity-50 text-xs ml-1">{topicCounts[t.id] ?? 0}</span>
            </Link>
          ))}
        </div>

        {/* ── Notes Masonry / Grid ── */}
        {rest.length === 0 && allNotes.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-[#111114] border border-dashed border-black/10 dark:border-white/10 rounded-[32px]">
            <p className="text-6xl mb-6">📝</p>
            <p className="text-2xl font-black mb-3">No public notes yet</p>
            <p className="text-[#6b7280] dark:text-[#a1a1aa] mb-8">Be the first to publish a note to the global feed!</p>
            <Link href="/login" className="px-8 py-4 bg-gradient-to-r from-[#7F77DD] to-[#9F97ED] text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl active:scale-95 transition-all">Start Writing</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(rest.length > 0 ? rest : allNotes).map((note) => {
              const av = avatarStyle(note.author)
              return (
                <Link key={`${note.author}-${note.slug}`} href={`/@${note.author}/${note.slug}`} className="block group active:scale-[0.98] transition-transform duration-300 h-full">
                  <div className="bg-white dark:bg-[#111114] border border-black/5 dark:border-white/10 group-hover:border-[#7F77DD]/50 group-hover:shadow-[0_20px_40px_-15px_rgba(127,119,221,0.2)] transition-all duration-300 rounded-[28px] p-7 flex flex-col h-full relative overflow-hidden">
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7F77DD]/0 to-[#7F77DD]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    <div className="flex flex-wrap items-center gap-2 mb-4 z-10">
                      {note.tags.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-[#f3f4f6] dark:bg-white/5 text-[#6b7280] dark:text-[#a1a1aa] group-hover:bg-[#7F77DD]/10 group-hover:text-[#7F77DD] transition-colors">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <h3 className="text-xl font-bold leading-[1.3] mb-3 group-hover:text-[#7F77DD] transition-colors z-10">{note.title}</h3>
                    <p className="text-[15px] text-[#6b7280] dark:text-[#a1a1aa] leading-[1.6] line-clamp-3 mb-6 flex-1 z-10">
                      {note.contentPreview}
                    </p>
                    
                    <div className="flex items-center justify-between pt-5 border-t border-black/5 dark:border-white/5 mt-auto z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: av.bg, color: av.color }}>
                          {getInitials(note.author)}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold leading-tight">@{note.author}</p>
                          <p className="text-[11px] text-[#6b7280] dark:text-[#a1a1aa] font-medium">{formatDate(note.publishedAt)}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#6b7280] dark:text-[#a1a1aa] opacity-50 group-hover:opacity-100 transition-opacity">{readTime(note.contentPreview)}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
    </>
  )
}

function FeedSkeleton() {
  return (
    <div className="animate-pulse space-y-12">
      <div className="h-[400px] bg-black/5 dark:bg-white/5 rounded-[32px]" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-[300px] bg-black/5 dark:bg-white/5 rounded-[28px]" />
        ))}
      </div>
    </div>
  )
}
