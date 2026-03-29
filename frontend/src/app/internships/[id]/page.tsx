import { notFound } from 'next/navigation'
import Link from 'next/link'
import { internshipApi } from '@/lib/api'
import { ApplyBar } from '@/components/ApplyBar'
import { formatStipend, formatDeadline, scoreTier, scoreLabel, scoreBreakdown } from '@/lib/score'
import type { Metadata } from 'next'

type Props = { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await internshipApi.get(params.id).catch(() => null)
  if (!item) return { title: 'Not Found · Interna' }
  return { title: `${item.title} at ${item.company.name} · Interna` }
}

export default async function InternshipDetailPage({ params }: Props) {
  const item = await internshipApi.get(params.id).catch(() => null)
  if (!item) notFound()

  const tier  = item.matchScore ? scoreTier(item.matchScore.total) : null
  const label = tier ? scoreLabel(tier) : null

  return (
    <>
      <article className="detail">
        <Link href="/internships" className="back-btn">← Back to results</Link>

        <div className="detail-header">
          <div className="detail-company">
            <div className="detail-logo">{item.company.name[0]}</div>
            <div>
              <p className="detail-company-name">{item.company.name} · {item.field}</p>
              <h1 className="detail-title">{item.title}</h1>
            </div>
          </div>

          {item.matchScore && tier && (
            <div className="detail-score-wrap">
              <span className={`detail-score-value score-${tier}`}>
                {item.matchScore.total}
              </span>
              <span className={`detail-score-label score-${tier}`}>
                {label} match
              </span>
              <span className="detail-score-breakdown">
                {scoreBreakdown(item.matchScore)}
              </span>
            </div>
          )}
        </div>

        <div className="detail-meta">
          <span className="detail-chip">📍 <strong>{item.location}</strong></span>
          <span className="detail-chip">⏱ <strong>{item.durationMonths} months</strong></span>
          <span className="detail-chip">
            💰 <strong>{formatStipend(item.stipendAmount, item.stipendCurrency)}</strong>
          </span>
          {item.remote && (
            <span className="detail-chip remote">🌐 <strong>Remote</strong></span>
          )}
        </div>

        <div className="detail-section">
          <h2 className="detail-section-title">About the role</h2>
          <p className="detail-body">{item.description}</p>
        </div>

        <div className="detail-section">
          <h2 className="detail-section-title">Requirements</h2>
          <ul className="detail-list">
            {item.requirements.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>

        <div className="detail-section">
          <h2 className="detail-section-title">Skills involved</h2>
          <div className="skill-grid">
            {item.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
          </div>
        </div>
      </article>

      <ApplyBar
        internshipId={item.id}
        deadline={formatDeadline(item.deadline)}
      />
    </>
  )
}
