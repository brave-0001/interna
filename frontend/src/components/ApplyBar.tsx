'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, SignInButton } from '@clerk/nextjs'
import { applicationApi } from '@/lib/api'

type Props = {
  internshipId: string
  deadline:     string
}

export function ApplyBar({ internshipId, deadline }: Props) {
  const router         = useRouter()
  const { user, isSignedIn } = useUser()
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    if (!user) return
    applicationApi.mine(user.id)
      .then(apps => setApplied(apps.some(a => a.internshipId === internshipId)))
      .catch(() => null)
  }, [user, internshipId])

  return (
    <div className="apply-bar">
      <div className="apply-bar-deadline">
        Closes <strong>{deadline}</strong>
      </div>

      {!isSignedIn ? (
        <SignInButton mode="modal">
          <button className="btn-primary">Sign in to apply</button>
        </SignInButton>
      ) : applied ? (
        <button className="btn-primary" disabled>✓ Applied</button>
      ) : (
        <button
          className="btn-primary"
          onClick={() => router.push(`/apply/${internshipId}`)}
        >
          Apply now
        </button>
      )}
    </div>
  )
}
