'use client'

import { Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { PenLine, AlertTriangle, User } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  const handleGuestLogin = () => {
    document.cookie = "noteflow-guest=true; path=/; max-age=31536000"
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--background)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[var(--p-purple)] rounded-2xl flex items-center justify-center text-white shadow-lg">
            <PenLine size={28} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Noteflow</h1>
        </div>

        <div className="glass-card rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--p-purple)] opacity-10 blur-3xl -mr-16 -mt-16" />
          
          <h2 className="text-xl font-semibold mb-2 text-center text-[var(--foreground)]">Welcome back</h2>
          <p className="text-[var(--muted-text)] text-sm text-center mb-8">
            Your notes. Your GitHub. Zero lock-in.
          </p>

          {error === 'OAuthSignin' && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-900/50 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">GitHub Config Missing</p>
                <p>Please configure GITHUB_ID and GITHUB_SECRET in your .env.local file to use cloud sync, or continue as a guest below.</p>
              </div>
            </div>
          )}

          <button
            onClick={() => signIn('github', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 bg-[var(--foreground)] text-[var(--background)] py-4 rounded-2xl font-medium hover:opacity-90 transition-all shadow-lg active:scale-[0.98] mb-3"
          >
            <GithubIcon size={20} />
            <span>Continue with GitHub</span>
          </button>
          
          <button
            onClick={handleGuestLogin}
            className="w-full flex items-center justify-center gap-3 border border-[var(--border)] text-[var(--foreground)] bg-[var(--card-bg)] py-4 rounded-2xl font-medium hover:bg-[var(--muted)] transition-all shadow-sm active:scale-[0.98]"
          >
            <User size={20} />
            <span>Continue as Guest (Offline)</span>
          </button>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)]">
              <div className="w-2 h-2 rounded-full bg-[var(--p-blue)]" />
              <p className="text-xs text-[var(--muted-text)]">
                Notes are stored as JSON files in your private repo.
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)]">
              <div className="w-2 h-2 rounded-full bg-[var(--p-teal)]" />
              <p className="text-xs text-[var(--muted-text)]">
                Full offline access via local browser cache.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[var(--muted-text)]">
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
