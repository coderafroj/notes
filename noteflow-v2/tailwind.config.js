/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'p-purple': '#7F77DD',
        'p-teal': '#1D9E75',
        'p-amber': '#EF9F27',
        'p-blue': '#378ADD',
        'p-red': '#E24B4A',
        'p-green': '#639922',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease both',
        'spin-slow': 'spin 2s linear infinite',
        'slide-up': 'slide-up 0.3s ease both',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'none' } },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
