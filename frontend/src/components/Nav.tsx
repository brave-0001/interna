'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, UserButton, SignInButton } from '@clerk/nextjs'

export function Nav() {
  const pathname = usePathname()
  const { isSignedIn } = useUser()

  return (
    <nav className="nav">
      <Link href="/internships" className="nav-logo">
        intern<span>a</span>
      </Link>

      <div className="nav-links">
        <Link
          href="/internships"
          className={`nav-link ${pathname.startsWith('/internships') ? 'active' : ''}`}
        >
          Discover
        </Link>

        {isSignedIn && (
          <Link
            href="/dashboard"
            className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
        )}

        <Link
          href="/company/post"
          className={`nav-link ${pathname === '/company/post' ? 'active' : ''}`}
        >
          For Companies
        </Link>

        {isSignedIn ? (
          <UserButton afterSignOutUrl="/internships" />
        ) : (
          <SignInButton mode="modal">
            <button className="nav-cta">Sign in</button>
          </SignInButton>
        )}
      </div>
    </nav>
  )
}
