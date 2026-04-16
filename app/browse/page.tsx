// app/browse/page.tsx — Browse all public notes with topic filter
import Link from 'next/link'
import { getPublicIndex } from '@/lib/publish'
import { formatDate } from '@/lib/utils'

const TOPICS = [
  { id: 'all', label: 'All' },
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
  searchParams: { topic?: string; q?: string }
}

export default async function BrowsePage({ searchParams }: Props) {
  const activeTopic = searchParams.topic ?? 'all'
  const searchQuery = searchParams.q ?? ''

  const authors = ['coderafroj']
  const allNotes: any[] = []
  for (const author of authors) {
    try {
      const notes = await getPublicIndex(author)
      for (const n of notes) allNotes.push({ ...n, author })
    } catch {}
  }

  const filtered = allNotes
    .filter((n) => activeTopic === 'all' || n.tags.includes(activeTopic))
    .filter((n) => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.contentPreview.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6', fontFamily: 'system-ui, sans-serif', color: '#0f0f0f' }}>
      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e5e4df', zIndex: 50, height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#0f0f0f', fontWeight: 700, fontSize: 16 }}>
          <div style={{ width: 28, height: 28, background: '#7F77DD', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>N</div>
          Noteflow
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/login" style={{ padding: '6px 14px', background: '#7F77DD', borderRadius: 8, fontSize: 13, textDecoration: 'none', color: '#fff', fontWeight: 600 }}>Start writing →</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Browse notes</h1>
          <p style={{ fontSize: 14, color: '#888780' }}>{filtered.length} notes{activeTopic !== 'all' ? ` in ${activeTopic}` : ''}</p>
        </div>

        {/* Search */}
        <form method="GET" style={{ marginBottom: 20 }}>
          <input type="hidden" name="topic" value={activeTopic} />
          <input name="q" defaultValue={searchQuery} placeholder="Search by title or content..."
            style={{ width: '100%', maxWidth: 480, padding: '10px 16px', border: '1px solid #e5e4df', borderRadius: 12, fontSize: 14, background: '#fff', outline: 'none', color: '#0f0f0f' }}
          />
        </form>

        {/* Topic pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {TOPICS.map((t) => (
            <Link key={t.id} href={`/browse?topic=${t.id}`}
              style={{
                padding: '6px 14px', borderRadius: 999, border: '1px solid',
                borderColor: activeTopic === t.id ? '#7F77DD' : '#e5e4df',
                fontSize: 12, fontWeight: 600, textDecoration: 'none',
                color: activeTopic === t.id ? '#fff' : '#888780',
                background: activeTopic === t.id ? '#7F77DD' : '#fff',
              }}
            >{t.label}</Link>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map((note) => {
            const av = avatarStyle(note.author)
            return (
              <Link key={`${note.author}-${note.slug}`} href={`/@${note.author}/${note.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div 
                  className="bg-white border border-[#e5e4df] hover:border-[#7F77DD] hover:-translate-y-[2px] transition-all duration-150"
                  style={{ borderRadius: 14, padding: 18, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                    {note.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 5, background: '#EEEDFE', color: '#534AB7', fontWeight: 600 }}>#{tag}</span>
                    ))}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35, marginBottom: 8, flex: 1 }}>{note.title}</h3>
                  <p style={{ fontSize: 13, color: '#888780', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                    {note.contentPreview}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid #f2f1ed', marginTop: 'auto' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: av.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: av.color }}>
                      {note.author.slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>@{note.author}</span>
                    <span style={{ fontSize: 11, color: '#888780', marginLeft: 'auto' }}>{formatDate(note.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#888780' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No notes found</p>
            <p style={{ fontSize: 14 }}>Try a different topic or search term.</p>
          </div>
        )}
      </div>
    </div>
  )
}
