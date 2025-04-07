import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from './providers'
import Header from '@/components/Header'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DeepFilm",
  description: "Turn Words into Cinema",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-black">
      <body className={`${inter.className} bg-black`}>
        <Providers>
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}