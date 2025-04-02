'use client'

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from '@clerk/nextjs'
import { SignedIn, UserButton, SignedOut, SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { dark } from "@clerk/themes"
import { usePathname } from 'next/navigation'


const inter = Inter({ subsets: ["latin"] })





export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')
  return (
    <ClerkProvider appearance={{
      baseTheme: dark,
    }}>
      <html lang="en">
        <body className={inter.className}>
          <header className="mx-auto py-4 px-4 flex justify-between items-center bg-black ">
          <div className="flex items-center">
          <span className="text-xl font-medium tracking-tight">DEEPFILM</span>
        </div>
        <div className="flex-grow">
            </div> 
        
        <div className="">
        {!isAuthPage && (
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button variant="default" className="bg-white text-black hover:bg-white/90 rounded-full px-6">
                        Login
                      </Button>
                    </SignInButton>
                  </SignedOut>
                )}
          <SignedIn>
            <UserButton>
          
            </UserButton>
          </SignedIn>
        </div>
          
          </header>
          
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}



import './globals.css'