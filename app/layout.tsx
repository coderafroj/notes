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
  title: "Noteflow | Your Notes, Your GitHub",
  description: "A premium notes application that stores your data in your own private GitHub repository.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          {children}
          <SyncListener />
        </AuthProvider>
        <ConnectionStatus />
        <PWARegister />
      </body>
    </html>
  );
}
