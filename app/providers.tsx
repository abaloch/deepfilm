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
          colorPrimary: "#ffffff",
          colorText: "#ffffff",
          colorBackground: "#000000",
          colorInputBackground: "#000000",
          colorInputText: "#ffffff",
        },
        elements: {
          userButtonPopoverCard: {
            pointerEvents: 'auto',
          },
          formButtonPrimary: {
            backgroundColor: "#ffffff",
            color: "#000000",
            "&:hover": {
              backgroundColor: "#ffffff",
              opacity: 0.9,
            },
          },
          card: {
            backgroundColor: "#000000",
            boxShadow: "none",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
          headerTitle: {
            color: "#ffffff",
          },
          headerSubtitle: {
            color: "#ffffff",
          },
          socialButtonsBlockButton: {
            backgroundColor: "#000000",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#000000",
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