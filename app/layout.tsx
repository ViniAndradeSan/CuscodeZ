import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Lora } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const _lora = Lora({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: 'São João Acessível',
  description: 'Seu guia sensorial para curtir o São João de Sergipe com acessibilidade e inclusão.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#D85A30',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${_geist.variable} ${_geistMono.variable} ${_lora.variable} bg-background`}>
      <body className="font-sans antialiased min-h-dvh">
        {/* Fundo escuro fora do app — só visível em desktop */}
        <div className="min-h-dvh flex items-start justify-center">
          {/* Container do app — max 430px, simula celular */}
          <div
            id="app-shell"
            className="relative w-full min-h-dvh bg-background overflow-hidden"
            style={{ maxWidth: "430px" }}
          >
            {children}
          </div>
        </div>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
