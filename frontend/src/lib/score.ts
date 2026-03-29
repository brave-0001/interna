import type { MatchScore } from '@/types'

export type ScoreTier = 'strong' | 'good' | 'moderate' | 'low'

export function scoreTier(score: number): ScoreTier {
  if (score >= 90) return 'strong'
  if (score >= 70) return 'good'
  if (score >= 40) return 'moderate'
  return 'low'
}

export function scoreLabel(tier: ScoreTier): string {
  return { strong: 'Strong', good: 'Good', moderate: 'Moderate', low: 'Low' }[tier]
}

export function formatStipend(amount: number | null, currency: string | null): string {
  if (!amount) return 'Unpaid'
  return new Intl.NumberFormat('en', {
    style:                 'currency',
    currency:              currency ?? 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + '/mo'
}

export function formatDeadline(iso: string): string {
  const date = new Date(iso)
  const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000)
  if (days < 0)   return 'Closed'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days <= 7)  return `${days}d left`
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export function scoreBreakdown(ms: MatchScore): string {
  return `Field ${ms.breakdown.field}/40 · Skills ${ms.breakdown.skills}/35 · Year ${ms.breakdown.year}/25`
}
