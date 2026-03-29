'use client'

import { useState, useEffect } from 'react'
import { applicationApi } from '@/lib/api'
import type { Application } from '@/types'

export function useApplications(clerkId: string | undefined) {
  const [apps, setApps]       = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!clerkId) { setLoading(false); return }
    applicationApi.mine(clerkId)
      .then(data => { setApps(data); setLoading(false) })
      .catch(err  => { setError((err as Error).message); setLoading(false) })
  }, [clerkId])

  return { apps, loading, error }
}
