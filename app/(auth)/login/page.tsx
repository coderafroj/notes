'use client'

import { Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { PenLine, AlertTriangle, User, ShieldCheck, Zap, Globe } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

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
  const error = searchParams?.get('error')
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user) {
      router.push('/dashboard')
    }
  }, [session, router])

  const handleGuestLogin = () => {
    document.cookie = "noteflow-guest=true; path=/; max-age=31536000"
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#09090b] selection:bg-[#7F77DD]/30">
      {/* Premium Cinematic Background */}
      <div className="absolute inset-0 w-full h-full -z-10 bg-black">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-[#7F77DD]/20 to-transparent rounded-full blur-[160px] animate-pulse duration-10000" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-[#1D9E75]/15 to-transparent rounded-full blur-[140px]" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 bg-gradient-to-br from-[var(--p-purple)] to-[var(--p-blue)] rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-[var(--p-purple)]/40 mb-8"
          >
            <PenLine size={40} strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-6xl font-black tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-b from-[var(--foreground)] to-[var(--muted-text)]">
            Noteflow
          </h1>
          <p className="text-[var(--muted-text)] font-semibold tracking-wide text-center">
            Your notes. Your GitHub. <span className="text-[var(--p-purple)]">Zero lock-in.</span>
          </p>
        </div>

        <div className="bg-[#111114]/80 backdrop-blur-3xl border border-white/10 rounded-[48px] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] relative z-10">
          <h2 className="text-3xl font-bold mb-3 text-center text-white tracking-tight">Welcome back</h2>
          <p className="text-[#a1a1aa] text-sm font-medium text-center mb-10">
            Securely synced with your private GitHub.
          </p>

          {(error === 'OAuthSignin' || error === 'OAuthCallback') && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mb-8 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 p-6 rounded-[32px] flex items-start gap-4"
            >
              <AlertTriangle size={24} className="shrink-0 mt-1" />
              <div className="text-xs leading-relaxed space-y-2">
                <p className="font-bold text-sm uppercase tracking-wider">Configuration Required</p>
                {error === 'OAuthCallback' ? (
                  <>
                    <p>It looks like your <span className="font-bold">Callback URL</span> or <span className="font-bold">NEXTAUTH_URL</span> is misconfigured.</p>
                    <p>Ensure your GitHub App allows <span className="font-mono bg-white/50 dark:bg-black/50 px-1 rounded">/api/auth/callback/github</span> and your environment variables match your current domain.</p>
                  </>
                ) : (
                  <p>GITHUB_ID and GITHUB_SECRET are missing. Set them in .env.local to enable cloud sync, or continue as a guest for local storage.</p>
                )}
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
              className="w-full h-16 flex items-center justify-center gap-4 bg-[var(--foreground)] text-[var(--background)] rounded-[24px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 dark:shadow-white/5 group"
            >
              <motion.div whileHover={{ rotate: 15 }}>
                <GithubIcon size={24} />
              </motion.div>
              <span>Continue with GitHub</span>
            </button>
            
            <button
              onClick={handleGuestLogin}
              className="w-full h-16 flex items-center justify-center gap-4 border-2 border-[var(--border)] text-[var(--foreground)] bg-transparent rounded-[24px] font-bold hover:bg-[var(--muted)] hover:border-transparent active:scale-[0.98] transition-all"
            >
              <User size={24} className="text-[var(--muted-text)]" />
              <span>Continue as Guest</span>
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--border)]/50 grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--muted)] flex items-center justify-center text-[var(--p-purple)] shadow-inner">
                <ShieldCheck size={24} />
              </div>
              <span className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-[0.1em]">Private</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--muted)] flex items-center justify-center text-[var(--p-teal)] shadow-inner">
                <Zap size={24} />
              </div>
              <span className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-[0.1em]">Fast</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--muted)] flex items-center justify-center text-[var(--p-blue)] shadow-inner">
                <Globe size={24} />
              </div>
              <span className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-[0.1em]">Secure</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-8">
          <p className="text-center text-xs font-bold text-[var(--muted-text)]/50 uppercase tracking-[0.3em]">
            User-owned data architecture
          </p>
          <div className="flex items-center gap-6">
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="w-2 h-2 rounded-full bg-[var(--p-purple)] opacity-60" />
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.5 }} className="w-2 h-2 rounded-full bg-[var(--p-teal)] opacity-60" />
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }} className="w-2 h-2 rounded-full bg-[var(--p-coral)] opacity-60" />
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
