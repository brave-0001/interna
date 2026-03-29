import Link from 'next/link'
import { scoreTier, scoreLabel, formatStipend, formatDeadline } from '@/lib/score'
import type { Internship } from '@/types'

type Props = {
  internship: Internship
  applied?:   boolean
}

export function InternshipCard({ internship: i, applied }: Props) {
  const tier  = i.matchScore ? scoreTier(i.matchScore.total) : null
  const label = tier ? scoreLabel(tier) : null

  return (
    <Link href={`/internships/${i.id}`} className="card">
      <div className="card-header">
        <div className="card-company">
          <div className="card-logo">{i.company.name[0]}</div>
          <div>
            <div className="card-company-name">{i.company.name}</div>
            <div className="card-role">{i.title}</div>
          </div>
        </div>

        {i.matchScore && tier && (
          <div className="match-score">
            <span className={`match-score-number score-${tier}`}>
              {i.matchScore.total}
            </span>
            <span className={`match-score-label score-${tier}`}>
              {label}
            </span>
          </div>
        )}
      </div>

      <div className="card-meta">
        <span className="card-meta-item">📍 {i.location}</span>
        <span className="meta-dot" />
        <span className="card-meta-item">⏱ {i.durationMonths}mo</span>
        {i.remote && (
          <>
            <span className="meta-dot" />
            <span className="card-meta-item remote">Remote</span>
          </>
        )}
      </div>

      <div className="card-tags">
        <span className="tag field">{i.field}</span>
        {i.skills.slice(0, 2).map(s => (
          <span key={s} className="tag">{s}</span>
        ))}
        {applied && <span className="tag applied">✓ Applied</span>}
      </div>

      <div className="card-footer">
        <div className="card-deadline">
          Closes <strong>{formatDeadline(i.deadline)}</strong>
        </div>
        <div className={`card-stipend${i.stipendAmount ? '' : ' unpaid'}`}>
          {formatStipend(i.stipendAmount, i.stipendCurrency)}
        </div>
      </div>

      <div className="card-reveal">
        <span className="card-reveal-text">View &amp; Apply →</span>
      </div>
    </Link>
  )
}
