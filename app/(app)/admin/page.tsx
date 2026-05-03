import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdminStats } from '@/lib/publish'
import { redirect } from 'next/navigation'
import { Users, FileText, Activity, ShieldCheck, ExternalLink, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.isAdmin) {
    redirect('/dashboard')
  }

  const { notes, authors, userStats } = await getAdminStats(session.user.login)

  const stats = [
    { label: 'Total Authors', value: authors.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Published Notes', value: notes.length, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Global Reach', value: authors.length * 12, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
  ]

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
            Admin Console <ShieldCheck className="text-[var(--p-purple)]" size={32} />
          </h1>
          <p className="text-[var(--muted-text)] font-medium">Monitoring Noteflow global ecosystem and decentralized discovery.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--p-purple)]/10 text-[var(--p-purple)] rounded-full text-sm font-bold border border-[var(--p-purple)]/20">
          Admin: {session.user.login}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--card-bg)] border border-[var(--border)] p-8 rounded-[32px] shadow-sm flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}>
              <s.icon size={32} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--muted-text)] uppercase tracking-widest">{s.label}</p>
              <p className="text-3xl font-black mt-1">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* User Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight">Discovered Authors</h2>
            <span className="text-xs font-bold bg-[var(--muted)] px-3 py-1 rounded-full text-[var(--muted-text)]">
              {authors.length} Total
            </span>
          </div>
          
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/30">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[var(--muted-text)]">User</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[var(--muted-text)]">Public Repo</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[var(--muted-text)] text-right">Notes</th>
                </tr>
              </thead>
              <tbody>
                {userStats.map((u) => (
                  <tr key={u.login} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/20 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--muted)] flex items-center justify-center overflow-hidden">
                          <User size={20} className="text-[var(--muted-text)]" />
                        </div>
                        <span className="font-bold">@{u.login}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <a 
                        href={`https://github.com/${u.login}/noteflow-public`} 
                        target="_blank" 
                        className="text-xs font-bold text-[var(--p-purple)] hover:underline flex items-center gap-1"
                      >
                        noteflow-public <ExternalLink size={12} />
                      </a>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-lg">{u.noteCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Global Activity */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black tracking-tight">Recent Activity</h2>
          <div className="space-y-4">
            {notes.slice(0, 10).map((note) => (
              <div key={note.id} className="bg-[var(--card-bg)] border border-[var(--border)] p-5 rounded-[24px] shadow-sm relative group hover:border-[var(--p-purple)] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--p-purple)]">Published</span>
                  <span className="text-[10px] text-[var(--muted-text)] font-medium">{formatDate(note.publishedAt)}</span>
                </div>
                <h3 className="font-bold text-sm mb-1 truncate">{note.title}</h3>
                <p className="text-xs text-[var(--muted-text)] mb-3 font-medium">by @{note.author}</p>
                <Link 
                  href={`/@${note.author}/${note.slug}`}
                  className="text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 text-[var(--foreground)] hover:text-[var(--p-purple)] transition-colors"
                >
                  View Note <ExternalLink size={10} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
