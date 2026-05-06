import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#7F77DD",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://merenotes.me"),
  title: "Noteflow | Your Notes, Your GitHub",
  description: "A premium notes application that stores your data in your own private GitHub repository.",
  keywords: ["noteflow", "notes app", "github notes", "markdown editor", "pwa", "developer notes"],
  authors: [{ name: "Noteflow" }],
  openGraph: {
    title: "Noteflow | Your Notes, Your GitHub",
    description: "A premium notes application that stores your data in your own private GitHub repository.",
    url: "https://merenotes.me",
    siteName: "Noteflow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Noteflow | Your Notes, Your GitHub",
    description: "A premium notes application that stores your data in your own private GitHub repository.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Noteflow",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
};

import PWARegister from '@/components/PWARegister'
import SyncListener from '@/components/providers/SyncListener'
import ConnectionStatus from '@/components/shared/ConnectionStatus'
import BottomNav from '@/components/mobile/BottomNav'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased pb-24 lg:pb-0">
        <AuthProvider>
          {children}
          <BottomNav />
          <SyncListener />
        </AuthProvider>
        <ConnectionStatus />
        <PWARegister />
      </body>
    </html>
  );
}
