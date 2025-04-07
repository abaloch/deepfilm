'use client'

import { ClerkProvider } from '@clerk/nextjs'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          userButtonPopoverCard: {
            pointerEvents: 'auto',
          },
        },
      }}
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  )
} 