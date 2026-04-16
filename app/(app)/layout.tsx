import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/sidebar/Sidebar'
import BottomNav from '@/components/mobile/BottomNav'
import CommandPalette from '@/components/ui/CommandPalette'
import SyncListener from '@/components/providers/SyncListener'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  // Allow guest mode — check happens client-side in store
  // Only redirect if explicitly not logged in AND no guest flag
  // (guest mode is handled client-side via zustand store)

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <SyncListener />
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </div>
        <BottomNav />
      </main>
      <CommandPalette />
    </div>
  )
}
