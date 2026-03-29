import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Nav } from '@/components/Nav'
import './globals.css'

export const metadata: Metadata = {
  title:       'Interna — Find internships that fit',
  description: 'Discover relevant internships scored to your skills, course, and year.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Nav />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
