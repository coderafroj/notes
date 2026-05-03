import Link from 'next/link'
import { WifiOff, Home } from 'lucide-react'

export const metadata = {
  title: 'Offline | Noteflow',
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#7F77DD]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1D9E75]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="bg-[#111114]/80 backdrop-blur-3xl border border-white/10 rounded-[48px] p-8 md:p-12 max-w-md w-full text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] relative z-10">
        <div className="w-20 h-20 bg-[#7F77DD]/10 text-[#7F77DD] rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
          <WifiOff size={40} strokeWidth={2.5} />
        </div>
        
        <h1 className="text-3xl font-black mb-4 text-white tracking-tight">You're Offline</h1>
        <p className="text-[#a1a1aa] mb-10 leading-relaxed font-medium">
          Internet connection lost. Noteflow is still active locally! You can continue writing and your notes will sync automatically once you're back online.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/dashboard" 
            className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-white text-black rounded-2xl font-bold shadow-xl hover:shadow-white/10 transition-all active:scale-95"
          >
            <Home size={20} />
            Return to Dashboard
          </Link>
          
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6b7280]">
            Local Sync Active
          </p>
        </div>
      </div>
    </div>
  )
}
