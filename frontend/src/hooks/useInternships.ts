'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { internshipApi } from '@/lib/api'
import type { Internship, InternshipFilters } from '@/types'

type State = {
  items:   Internship[]
  total:   number
  loading: boolean
  error:   string | null
}

export function useInternships(clerkId?: string) {
  const [filters, setFilters] = useState<InternshipFilters>({ sort: 'match', page: 1 })
  const [state, setState]     = useState<State>({ items: [], total: 0, loading: true, error: null })
  const timer                 = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (f: InternshipFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const res = await internshipApi.list(f, clerkId)
      setState({ items: res.data, total: res.total, loading: false, error: null })
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: (err as Error).message }))
    }
  }, [clerkId])

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => load(filters), 300)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [filters, load])

  const updateFilter = useCallback(<K extends keyof InternshipFilters>(
    key: K, value: InternshipFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value, page: key !== 'page' ? 1 : value as number }))
  }, [])

  const clearFilter = useCallback((key: keyof InternshipFilters) => {
    setFilters(prev => { const next = { ...prev }; delete next[key]; return { ...next, page: 1 } })
  }, [])

  const clearAll = useCallback(() => setFilters({ sort: 'match', page: 1 }), [])

  return { ...state, filters, updateFilter, clearFilter, clearAll }
}
