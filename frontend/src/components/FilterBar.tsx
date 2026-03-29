'use client'

import type { InternshipFilters } from '@/types'

type Props = {
  filters:      InternshipFilters
  onChange:     <K extends keyof InternshipFilters>(key: K, value: InternshipFilters[K]) => void
  onClear:      (key: keyof InternshipFilters) => void
}

const FIELDS = [
  // Technology
  'Software Engineering', 'Data Science', 'Cybersecurity', 'IT Support', 'AI & Machine Learning',
  // Business
  'Finance', 'Accounting', 'Marketing', 'Human Resources', 'Operations', 'Procurement', 'Entrepreneurship',
  // Education
  'Education Science', 'Early Childhood Education', 'Special Needs Education', 'Curriculum Development',
  // Health
  'Medicine', 'Nursing', 'Public Health', 'Pharmacy', 'Nutrition & Dietetics', 'Clinical Psychology',
  // Engineering
  'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Chemical Engineering', 'Environmental Engineering',
  // Agriculture
  'Agriculture', 'Agribusiness', 'Food Science', 'Veterinary Science', 'Horticulture',
  // Science
  'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Environmental Science',
  // Social Sciences
  'Economics', 'Sociology', 'Psychology', 'Political Science', 'International Relations',
  // Law
  'Law', 'Paralegal Studies',
  // Arts & Media
  'Journalism', 'Communication', 'Media Production', 'Graphic Design', 'Architecture',
  // Hospitality
  'Hospitality Management', 'Tourism', 'Events Management',
]
const LOCATIONS = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega',
  'Nyeri', 'Machakos', 'Meru', 'Kisii', 'Kericho',
  'Embu', 'Migori', 'Homabay', 'Bungoma', 'Kilifi',
  'Remote'
]

const DURATIONS = [
  { label: '1 month',  value: 1 },
  { label: '2 months', value: 2 },
  { label: '3 months', value: 3 },
  { label: '4 months', value: 4 },
  { label: '5 months', value: 5 },
  { label: '6 months', value: 6 },
  { label: '8 months', value: 8 },
  { label: '12 months', value: 12 },
]

export function FilterBar({ filters, onChange, onClear }: Props) {
  const activePills: { label: string; key: keyof InternshipFilters }[] = []
  if (filters.field)    activePills.push({ label: filters.field,               key: 'field' })
  if (filters.location) activePills.push({ label: filters.location,            key: 'location' })
  if (filters.duration) activePills.push({ label: `${filters.duration} months`, key: 'duration' })
  if (filters.remote)   activePills.push({ label: 'Remote only',               key: 'remote' })

  return (
    <div className="filter-wrap">
      <div className="filter-bar">
        <div className="search-wrap">
          <svg className="search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Role, company, or skill…"
            value={filters.search ?? ''}
            onChange={e => onChange('search', e.target.value || undefined)}
          />
        </div>

        <div className="filter-divider" />

        <select
          className="filter-select"
          value={filters.field ?? ''}
          onChange={e => onChange('field', e.target.value || undefined)}
        >
          <option value="">All Fields</option>
          {FIELDS.map(f => <option key={f}>{f}</option>)}
        </select>

        <div className="filter-divider" />

        <select
          className="filter-select"
          value={filters.location ?? ''}
          onChange={e => onChange('location', e.target.value || undefined)}
        >
          <option value="">Any Location</option>
          {LOCATIONS.map(l => <option key={l}>{l}</option>)}
        </select>

        <div className="filter-divider" />

        <select
          className="filter-select"
          value={filters.duration ?? ''}
          onChange={e => onChange('duration', e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">Any Duration</option>
          {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>

        <div className="filter-divider" />

        <button
          className={`remote-toggle${filters.remote ? ' on' : ''}`}
          onClick={() => onChange('remote', filters.remote ? undefined : true)}
        >
          <div className="toggle-track" />
          Remote only
        </button>
      </div>

      {activePills.length > 0 && (
        <div className="active-pills">
          {activePills.map(p => (
            <button key={p.key} className="filter-pill" onClick={() => onClear(p.key)}>
              {p.label}
              <span className="pill-x">×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
