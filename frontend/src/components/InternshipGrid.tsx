'use client'

import { useUser } from '@clerk/nextjs'
import { useInternships } from '@/hooks/useInternships'
import { useApplications } from '@/hooks/useApplications'
import { InternshipCard } from './InternshipCard'
import { FilterBar } from './FilterBar'

export function InternshipGrid() {
  const { user }     = useUser()
  const { apps }     = useApplications(user?.id)
  const appliedIds   = new Set(apps.map(a => a.internshipId))

  const {
    items, total, loading, error,
    filters, updateFilter, clearFilter,
  } = useInternships(user?.id)

  return (
    <>
      <FilterBar
        filters={filters}
        onChange={updateFilter}
        onClear={clearFilter}
      />

      <div className="results-meta">
        <p className="results-count">
          <strong>{total}</strong> internships found
        </p>
        <div className="sort-wrap">
          Sort by&nbsp;
          <select
            className="sort-select"
            value={filters.sort ?? 'match'}
            onChange={e => updateFilter('sort', e.target.value as 'match' | 'deadline' | 'stipend')}
          >
            <option value="match">Match Score</option>
            <option value="deadline">Deadline</option>
            <option value="stipend">Stipend</option>
          </select>
        </div>
      </div>

      <div className="internship-grid">
        {loading && (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-skeleton" />
          ))
        )}

        {!loading && error && (
          <div className="empty-state">
            <div className="empty-icon">⚠</div>
            <p className="empty-title">Could not load internships</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <p className="empty-title">No internships found</p>
            <p>Try adjusting your filters.</p>
          </div>
        )}

        {!loading && items.map(i => (
          <InternshipCard
            key={i.id}
            internship={i}
            applied={appliedIds.has(i.id)}
          />
        ))}
      </div>
    </>
  )
}
