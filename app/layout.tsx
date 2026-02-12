import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'] })

// Default metadata for the app
export const metadata: Metadata = {
  title: 'Task-O | Task Management Website',
  description: 'Professional task and project management application',
}

import { ThemeProvider } from '@/components/ThemeProvider'
import { SidebarProvider } from '@/components/SidebarContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}