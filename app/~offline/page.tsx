import Link from 'next/link'

export const metadata = {
  title: 'Offline | Noteflow',
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#f8f8f6] font-sans text-[#0f0f0f] flex flex-col items-center justify-center p-4">
      <div className="bg-white border border-[#e5e4df] rounded-[24px] p-8 md:p-12 max-w-md w-full text-center shadow-lg">
        <div className="w-20 h-20 bg-[#FBEAF0] text-[#993556] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold mb-3">You are offline</h1>
        <p className="text-[#888780] mb-8 leading-relaxed">
          It seems you've lost your internet connection. Noteflow works offline, but this specific page hasn't been cached yet.
        </p>
        <Link 
          href="/" 
          className="inline-flex w-full items-center justify-center px-6 py-3.5 bg-[#7F77DD] text-white rounded-xl font-bold shadow-md hover:bg-[#6b62cf] transition-all active:scale-95"
        >
          Go to App Home
        </Link>
      </div>
    </div>
  )
}
