'use client'

import { SignedIn, UserButton, SignedOut, SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { usePathname } from 'next/navigation'
import AccountButton from '@/components/AccountButton'

export default function Header() {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')

  return (
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
  )
} 