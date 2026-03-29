export type Role          = 'STUDENT' | 'COMPANY' | 'ADMIN'
export type AppStatus     = 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED'
export type ListingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED'

export type MatchScore = {
  total:     number
  breakdown: { field: number; skills: number; year: number }
}

export type Company = {
  id:          string
  name:        string
  logoUrl:     string | null
  industry:    string
  website:     string | null
  description: string | null
  verified:    boolean
}

export type Internship = {
  id:              string
  title:           string
  field:           string
  description:     string
  requirements:    string[]
  skills:          string[]
  location:        string
  remote:          boolean
  durationMonths:  number
  stipendAmount:   number | null
  stipendCurrency: string | null
  minYear:         number
  maxYear:         number
  deadline:        string
  status:          ListingStatus
  company:         Pick<Company, 'name' | 'logoUrl' | 'industry'>
  matchScore:      MatchScore | null
  createdAt:       string
}

export type Application = {
  id:           string
  studentId:    string
  internshipId: string
  status:       AppStatus
  coverLetter:  string | null
  cvUrl:        string
  createdAt:    string
  updatedAt:    string
  internship:   Pick<Internship, 'title' | 'deadline' | 'location' | 'durationMonths'> & {
    company: Pick<Company, 'name' | 'logoUrl'>
  }
}

export type StudentProfile = {
  id:          string
  name:        string
  university:  string
  course:      string
  yearOfStudy: number
  skills:      string[]
  cvUrl:       string | null
  bio:         string | null
}

export type PaginatedResponse<T> = {
  data:  T[]
  total: number
  page:  number
  limit: number
}

export type InternshipFilters = {
  search?:   string
  field?:    string
  location?: string
  duration?: number
  remote?:   boolean
  sort?:     'match' | 'deadline' | 'stipend'
  page?:     number
}
