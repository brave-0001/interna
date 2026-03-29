'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { userApi } from '@/lib/api'
import type { StudentProfile } from '@/types'

export function ProfileBanner() {
  const { user, isSignedIn } = useUser()
  const [profile, setProfile] = useState<StudentProfile | null>(null)

  useEffect(() => {
    if (!user) return
    userApi.me(user.id)
      .then(data => setProfile(data.student))
      .catch(() => null)
  }, [user])

  if (!isSignedIn || !profile) return null

  return (
    <div className="profile-banner-wrap">
      <button className="profile-banner">
        <div className="profile-banner-left">
          <div className="profile-dot" />
          <div>
            <div className="profile-banner-text">Match Score is active</div>
            <div className="profile-banner-sub">
              {profile.course} · Year {profile.yearOfStudy} · {profile.skills.slice(0, 4).join(', ')}
            </div>
          </div>
        </div>
        <div className="profile-banner-action">Edit profile →</div>
      </button>
    </div>
  )
}
