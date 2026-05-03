'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { syncToGitHub } from '@/lib/sync'
import { useNoteflowStore } from '@/lib/store'

export default function SyncListener() {
  const { data: session } = useSession()
  const { isGuest } = useNoteflowStore()

  useEffect(() => {
    // We only sync to GitHub if the user is logged in (not a guest)
    if (isGuest || !session?.accessToken || !session?.user?.login) return

    const handleOnline = async () => {
      console.log('[SyncListener] Internet restored or app started online. Auto-syncing pending notes to GitHub...')
      try {
        await syncToGitHub(session.accessToken, session.user.login)
        console.log('[SyncListener] Background sync successful! Dexie Database matched to GitHub.')
      } catch (err) {
        console.error('[SyncListener] Background sync failed:', err)
      }
    }

    // Sync if already online when component mounts
    if (navigator.onLine) {
      handleOnline()
    }

    window.addEventListener('online', handleOnline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [session, isGuest])

  // This component handles logic only, rendering nothing.
  return null
}
