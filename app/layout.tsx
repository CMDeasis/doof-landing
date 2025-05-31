import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DOOFIO',
  description: 'Your gateway to an epic digital experience',
  generator: 'DOOFIO',
  icons: {
    icon: '/doofio.png',
    apple: '/doofio.png',
    shortcut: '/doofio.png'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

