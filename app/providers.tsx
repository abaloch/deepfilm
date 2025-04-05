'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { neobrutalism } from "@clerk/themes"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{
      baseTheme: neobrutalism,
    }}>
      {children}
    </ClerkProvider>
  )
} 