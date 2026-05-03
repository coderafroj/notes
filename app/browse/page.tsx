import Link from 'next/link'
import { getGlobalFeed } from '@/lib/publish'
import { formatDate } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const TOPICS = [
  { id: 'all', label: 'All notes' },
  { id: 'sql', label: 'SQL' },
  { id: 'python', label: 'Python' },
  { id: 'webdev', label: 'Web Dev' },
  { id: 'react', label: 'React' },
  { id: 'math', label: 'Math' },
  { id: 'ai', label: 'AI / ML' },
]

const AVATAR_STYLES = [
  { bg: '#EEEDFE', color: '#534AB7' },
  { bg: '#E1F5EE', color: '#0F6E56' },
  { bg: '#E6F1FB', color: '#185FA5' },
  { bg: '#FAEEDA', color: '#854F0B' },
  { bg: '#FBEAF0', color: '#993556' },
]

function avatarStyle(login: string) {
  return AVATAR_STYLES[login.charCodeAt(0) % AVATAR_STYLES.length]
}

interface Props {
  searchParams: Promise<{ topic?: string; q?: string }>
}

export default async function BrowsePage({ searchParams }: Props) {
  const params = await searchParams
  const activeTopic = params.topic ?? 'all'
  const searchQuery = params.q ?? ''

  const session = await getServerSession(authOptions)
  
  const allNotes = await getGlobalFeed(session?.user?.login)

  const filtered = allNotes
    .filter((n) => activeTopic === 'all' || n.tags.includes(activeTopic))
    .filter((n) => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || (n.contentPreview && n.contentPreview.toLowerCase().includes(searchQuery.toLowerCase())))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return (
    <div className="min-h-screen bg-[#f8f8f6] font-sans text-[#0f0f0f]">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-[#e5e4df] z-50 h-14 md:h-16 flex items-center px-4 md:px-8 justify-between">
        <Link href="/" className="flex items-center gap-2 md:gap-3 outline-none active:scale-95 transition-transform">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-[#7F77DD] rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-sm">N</div>
          <span className="font-bold text-base md:text-lg">Noteflow</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/login" className="px-4 py-1.5 md:px-5 md:py-2 bg-[#7F77DD] text-white rounded-lg md:rounded-xl text-[13px] md:text-sm font-bold shadow-md hover:bg-[#6b62cf] hover:shadow-lg active:scale-95 transition-all">Write <span className="hidden sm:inline">→</span></Link>
        </div>
      </nav>

      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-6 md:mb-8">
          <h1 className="text-[28px] md:text-[34px] font-extrabold tracking-tight mb-1">Browse notes</h1>
          <p className="text-[13px] md:text-[15px] text-[#888780] font-medium">{filtered.length} notes{activeTopic !== 'all' ? ` in ${activeTopic}` : ''}</p>
        </div>

        {/* ── Search ── */}
        <form method="GET" className="mb-6">
          <input type="hidden" name="topic" value={activeTopic} />
          <div className="relative max-w-lg">
            <input name="q" defaultValue={searchQuery} placeholder="Search by title or content..."
              className="w-full pl-4 pr-10 py-3 md:py-3.5 bg-white border border-[#e5e4df] focus:border-[#7F77DD] focus:ring-4 focus:ring-[#7F77DD]/10 rounded-[14px] text-[14px] md:text-[15px] font-medium text-[#0f0f0f] outline-none shadow-sm transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-40">🔍</div>
          </div>
        </form>

        {/* ── Topic pills ── */}
        <div className="flex flex-wrap gap-2 md:gap-2.5 mb-8 md:mb-10">
          {TOPICS.map((t) => {
            const isActive = activeTopic === t.id
            return (
              <Link key={t.id} href={t.id === 'all' ? '/browse' : `/browse?topic=${t.id}`}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-[12px] md:text-[13px] font-bold active:scale-95 transition-all
                  ${isActive ? 'bg-[#7F77DD] text-white border-[#7F77DD] shadow-md' : 'bg-white text-[#888780] border-[#e5e4df] hover:border-[#7F77DD] hover:text-[#534AB7] hover:bg-[#EEEDFE] shadow-sm'}
                `}
              >
                {t.label}
              </Link>
            )
          })}
        </div>

        {/* ── Grid ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {filtered.map((note) => {
            const av = avatarStyle(note.author)
            return (
              <Link key={`${note.author}-${note.slug}`} href={`/@${note.author}/${note.slug}`} className="block group active:scale-[0.98] transition-transform">
                <div className="bg-white border border-[#e5e4df] group-hover:border-[#7F77DD] group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-200 rounded-[18px] p-5 relative overflow-hidden flex flex-col h-full min-h-[200px]">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {note.tags.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#EEEDFE] text-[#534AB7]">#{tag}</span>
                    ))}
                  </div>
                  <h3 className="text-[15px] md:text-[16px] font-bold leading-[1.35] mb-2 group-hover:text-[#7F77DD] transition-colors">{note.title}</h3>
                  <p className="text-[13px] text-[#888780] leading-[1.6] line-clamp-2 mb-4 flex-1">
                    {note.contentPreview}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#f2f1ed] mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold" style={{ background: av.bg, color: av.color }}>
                        {note.author.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[12px] font-bold">@{note.author}</span>
                    </div>
                    <span className="text-[11px] font-medium text-[#888780]">{formatDate(note.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 text-[#888780]">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-bold mb-1">No notes found</p>
            <p className="text-[14px]">Try a different topic or search term.</p>
          </div>
        )}
      </div>
    </div>
  )
}
