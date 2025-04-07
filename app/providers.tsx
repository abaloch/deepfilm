'use client'

import { ClerkProvider } from '@clerk/nextjs'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          logoPlacement: "inside",
          logoImageUrl: "/logo.png",
          socialButtonsVariant: "iconButton",
        },
        variables: {
          colorPrimary: "#000000",
          colorText: "#000000",
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#000000",
        },
        elements: {
          userButtonPopoverCard: {
            pointerEvents: 'auto',
          },
          formButtonPrimary: {
            backgroundColor: "#000000",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#000000",
              opacity: 0.9,
            },
          },
          card: {
            backgroundColor: "#ffffff",
            boxShadow: "none",
            border: "1px solid rgba(0, 0, 0, 0.1)",
          },
          headerTitle: {
            color: "#000000",
          },
          headerSubtitle: {
            color: "#000000",
          },
          socialButtonsBlockButton: {
            backgroundColor: "#ffffff",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            color: "#000000",
            "&:hover": {
              backgroundColor: "#ffffff",
              opacity: 0.9,
            },
          },
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
} 