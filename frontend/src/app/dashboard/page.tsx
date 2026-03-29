'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useApplications } from '@/hooks/useApplications'
import { formatDeadline } from '@/lib/score'
import type { AppStatus } from '@/types'



const STATUS_LABEL: Record<AppStatus, string> = {
  SUBMITTED:    'Submitted',
  UNDER_REVIEW: 'Under Review',
  ACCEPTED:     'Accepted',
  REJECTED:     'Rejected',
}

const STATUS_CLASS: Record<AppStatus, string> = {
  SUBMITTED:    'status-submitted',
  UNDER_REVIEW: 'status-under-review',
  ACCEPTED:     'status-accepted',
  REJECTED:     'status-rejected',
}

export default function DashboardPage() {
  const { user }          = useUser()
  const { apps, loading } = useApplications(user?.id)

  const counts = {
    total:    apps.length,
    active:   apps.filter(a => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').length,
    accepted: apps.filter(a => a.status === 'ACCEPTED').length,
    rejected: apps.filter(a => a.status === 'REJECTED').length,
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Applications</h1>
        <p className="dashboard-sub">Track every application in one place.</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-label">Total</p>
          <p className="stat-value">{counts.total}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Active</p>
          <p className="stat-value blue">{counts.active}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Accepted</p>
          <p className="stat-value green">{counts.accepted}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Rejected</p>
          <p className="stat-value red">{counts.rejected}</p>
        </div>
      </div>

      {loading && (
        <div className="app-list">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-skeleton" style={{ height: 80 }} />
          ))}
        </div>
      )}

      {!loading && apps.length === 0 && (
        <div className="empty-dash">
          <p>No applications yet.</p>
          <Link href="/internships" className="btn-primary">Browse internships</Link>
        </div>
      )}

      {!loading && apps.length > 0 && (
        <div className="app-list">
          {apps.map(app => (
            <Link key={app.id} href={`/internships/${app.internshipId}`} className="app-item">
              <div className="app-logo">{app.internship.company.name[0]}</div>
              <div className="app-body">
                <p className="app-title">{app.internship.title}</p>
                <p className="app-meta">
                  {app.internship.company.name} · {app.internship.location} · {app.internship.durationMonths}mo
                </p>
              </div>
              <div className="app-right">
                <span className={`status-pill ${STATUS_CLASS[app.status]}`}>
                  {STATUS_LABEL[app.status]}
                </span>
                <span className="app-date">{formatDeadline(app.internship.deadline)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
