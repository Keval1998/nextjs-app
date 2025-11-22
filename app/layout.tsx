import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from './components/header/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'My First NextJS App',
  description: 'Hello World PWA',
  icons: {
    icon: '/icons/icon-192.png',        // main favicon (browser tab)
    shortcut: '/icons/icon-192.png',    // shortcut icon
    apple: '/icons/icon-192.png',       // iOS home-screen icon
  },
  manifest: '/manifest.json',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
