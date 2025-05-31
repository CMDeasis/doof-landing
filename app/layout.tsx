import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'doofio 👾',
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
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  )
}


