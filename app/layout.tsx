'use client'

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from '@clerk/nextjs'
import { SignedIn, UserButton, SignedOut, SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { light } from "@clerk/themes"
import { usePathname } from 'next/navigation'
import AccountButton from '@/components/AccountButton'

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')
  return (
    <ClerkProvider appearance={{
      baseTheme: light,
    }}>
      <html lang="en" className={inter.className}>
        <body className="min-h-screen bg-white text-black">
          <header className="mx-auto px-4 flex justify-between items-center bg-black text-white" style={{ padding: '8px' }}>
            <div className="flex items-center">
              <span className="text-2xl tracking-tight" style={{ fontSize: '30px' }}>DEEPFILM</span>
            </div>
            <div className="flex-grow"></div>
            <div className="flex items-center" style={{ gap: '5px' }}>
              <SignedIn>
                <AccountButton />
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: {
                        width: '44px',
                        height: '44px'
                      }
                    }
                  }}
                />
              </SignedIn>
              {!isAuthPage && (
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="default" className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 text-lg font-medium" style={{ fontSize: '16px' , padding: '12px', border: '0px solid rgb(255, 255, 255)', borderRadius: '30px'}}>
                      Login
                    </Button>
                  </SignInButton>
                </SignedOut>
              )}
            </div>
          </header>
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}

import './globals.css'