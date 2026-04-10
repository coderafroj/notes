'use client'

import { Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { PenLine, AlertTriangle, User, ShieldCheck, Zap, Globe } from 'lucide-react'
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--background)] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--p-purple)]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--p-teal)]/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="w-16 h-16 bg-[var(--p-purple)] rounded-[24px] flex items-center justify-center text-white shadow-2xl shadow-[var(--p-purple)]/40 mb-6"
          >
            <PenLine size={32} strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-5xl font-bold tracking-tight mb-2">Noteflow</h1>
          <p className="text-[var(--muted-text)] font-medium">Elevate your note-taking experience.</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 md:p-10 shadow-2xl relative">
          <h2 className="text-2xl font-bold mb-2 text-center text-[var(--foreground)]">Welcome back</h2>
          <p className="text-[var(--muted-text)] text-sm text-center mb-10">
            Securely synced with your private GitHub.
          </p>

          {error === 'OAuthSignin' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mb-8 bg-red-50 dark:bg-red-900/10 text-red-500 border border-red-100 dark:border-red-900/30 p-5 rounded-3xl flex items-start gap-3"
            >
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-bold mb-1">Configuration Required</p>
                <p>GITHUB_ID and GITHUB_SECRET are missing. Set them in .env.local or continue as a guest.</p>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => signIn('github', { callbackUrl: '/' })}
              className="w-full h-16 flex items-center justify-center gap-3 bg-[var(--foreground)] text-[var(--background)] rounded-3xl font-bold hover:opacity-90 transition-all shadow-xl active:scale-[0.98]"
            >
              <GithubIcon size={22} />
              <span>Continue with GitHub</span>
            </button>
            
            <button
              onClick={handleGuestLogin}
              className="w-full h-16 flex items-center justify-center gap-3 border border-[var(--border)] text-[var(--foreground)] bg-[var(--card-bg)] rounded-3xl font-bold hover:bg-[var(--muted)] transition-all shadow-sm active:scale-[0.98]"
            >
              <User size={22} />
              <span>Continue as Guest</span>
            </button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[var(--muted)] flex items-center justify-center text-[var(--p-purple)]">
                <ShieldCheck size={20} />
              </div>
              <span className="text-[10px] font-bold text-[var(--muted-text)] uppercase tracking-wider">Private</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[var(--muted)] flex items-center justify-center text-[var(--p-teal)]">
                <Zap size={20} />
              </div>
              <span className="text-[10px] font-bold text-[var(--muted-text)] uppercase tracking-wider">Fast</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[var(--muted)] flex items-center justify-center text-[var(--p-blue)]">
                <Globe size={20} />
              </div>
              <span className="text-[10px] font-bold text-[var(--muted-text)] uppercase tracking-wider">Cloud</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6">
          <p className="text-center text-[10px] font-bold text-[var(--muted-text)] uppercase tracking-[0.2em]">
            Trust your thoughts to GitHub
          </p>
          <div className="flex items-center gap-4 text-[var(--muted-text)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--p-purple)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--p-teal)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--p-coral)]" />
          </div>
        </div>
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
