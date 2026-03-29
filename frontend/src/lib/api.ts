import type {
  Internship,
  Application,
  StudentProfile,
  PaginatedResponse,
  InternshipFilters,
} from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

type Options = {
  method?:  'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?:    unknown
  clerkId?: string
}

async function request<T>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (opts.clerkId) headers['x-clerk-user-id'] = opts.clerkId

  const res = await fetch(`${BASE}${path}`, {
    method:  opts.method ?? 'GET',
    headers,
    body:    opts.body ? JSON.stringify(opts.body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }

  return res.json()
}

export const internshipApi = {
  list(filters: InternshipFilters, clerkId?: string) {
    const p = new URLSearchParams()
    if (filters.search)   p.set('search',   filters.search)
    if (filters.field)    p.set('field',     filters.field)
    if (filters.location) p.set('location',  filters.location)
    if (filters.duration) p.set('duration',  String(filters.duration))
    if (filters.remote)   p.set('remote',    'true')
    if (filters.sort)     p.set('sort',      filters.sort)
    if (filters.page)     p.set('page',      String(filters.page))
    const qs = p.toString()
    return request<PaginatedResponse<Internship>>(
      `/internships${qs ? `?${qs}` : ''}`,
      { clerkId }
    )
  },

  get(id: string, clerkId?: string) {
    return request<Internship>(`/internships/${id}`, { clerkId })
  },

  create(
    data: Omit<Internship, 'id' | 'status' | 'company' | 'matchScore' | 'createdAt'>,
    clerkId: string
  ) {
    return request<Internship>('/internships', { method: 'POST', body: data, clerkId })
  },
}

export const applicationApi = {
  submit(
    data: { internshipId: string; cvUrl: string; coverLetter?: string },
    clerkId: string
  ) {
    return request<Application>('/applications', { method: 'POST', body: data, clerkId })
  },

  mine(clerkId: string) {
    return request<Application[]>('/applications/mine', { clerkId })
  },

  forInternship(internshipId: string, clerkId: string) {
    return request<Application[]>(`/applications/internship/${internshipId}`, { clerkId })
  },

  updateStatus(
    id: string,
    status: 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED',
    clerkId: string
  ) {
    return request<Application>(`/applications/${id}/status`, {
      method: 'PATCH',
      body:   { status },
      clerkId,
    })
  },
}

export const userApi = {
  me(clerkId: string) {
    return request<{ student: StudentProfile | null; company: unknown }>('/users/me', { clerkId })
  },

  updateStudentProfile(
    data: Omit<StudentProfile, 'id' | 'cvUrl'>,
    clerkId: string
  ) {
    return request<StudentProfile>('/users/me/student', { method: 'PUT', body: data, clerkId })
  },

  syncUser(data: { clerkId: string; email: string; role: 'STUDENT' | 'COMPANY' }) {
    return request('/users/sync', { method: 'POST', body: data })
  },
}
