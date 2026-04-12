import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/sidebar/Sidebar'
import BottomNav from '@/components/mobile/BottomNav'
import CommandPalette from '@/components/command-palette/CommandPalette'
import { AnimatePresence } from 'framer-motion'
import PageTransition from '@/components/shared/PageTransition'
import InstallPrompt from '@/components/mobile/InstallPrompt'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('noteflow-guest')?.value === 'true'

  if (!session && !isGuest) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-safe lg:pb-0">
          <AnimatePresence mode="wait">
            <PageTransition>
              {children}
            </PageTransition>
          </AnimatePresence>
        </div>
        <BottomNav />
        <InstallPrompt />
      </main>
      <CommandPalette />
    </div>
  )
}

