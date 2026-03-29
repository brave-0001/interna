'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { internshipApi } from '@/lib/api'

const FIELDS = ['Software Engineering', 'Data Science', 'Design', 'Finance', 'Marketing', 'Operations']

export default function PostInternshipPage() {
  const router   = useRouter()
  const { user } = useUser()

  const [form, setForm] = useState({
    title: '', field: FIELDS[0], description: '', location: '',
    remote: false, durationMonths: 3, stipendAmount: '',
    stipendCurrency: 'USD', minYear: 1, maxYear: 4,
    deadline: '', requirements: '', skills: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [done, setDone]             = useState(false)

  const set = (k: string, v: unknown) => setForm(prev => ({ ...prev, [k]: v }))

  const submit = async () => {
    if (!user) return
    setSubmitting(true)
    setError(null)
    try {
      await internshipApi.create({
        ...form,
        stipendAmount:  form.stipendAmount ? Number(form.stipendAmount) : null,
        stipendCurrency:form.stipendAmount ? form.stipendCurrency : null,
        durationMonths: Number(form.durationMonths),
        requirements:   form.requirements.split('\n').map(s => s.trim()).filter(Boolean),
        skills:         form.skills.split(',').map(s => s.trim()).filter(Boolean),
        deadline:       new Date(form.deadline).toISOString(),
        minYear:        Number(form.minYear),
        maxYear:        Number(form.maxYear),
      }, user.id)
      setDone(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="post-wrap">
        <div className="success-state">
          <div className="success-icon">✓</div>
          <h2 className="success-title">Listing submitted</h2>
          <p className="success-sub">
            Your internship listing is under review. It will go live once approved by our team.
          </p>
          <button className="btn-primary" onClick={() => router.push('/internships')}>
            Back to listings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="post-wrap">
      <h1 className="post-title">Post an Internship</h1>
      <p className="post-sub">Reviewed and approved before going live.</p>

      <div className="form-group">
        <label className="form-label">Role Title</label>
        <input className="form-input" placeholder="e.g. Software Engineering Intern"
          value={form.title} onChange={e => set('title', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Field</label>
        <select className="form-input" value={form.field} onChange={e => set('field', e.target.value)}>
          {FIELDS.map(f => <option key={f}>{f}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea"
          placeholder="What will the intern work on? What will they learn?"
          value={form.description} onChange={e => set('description', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Requirements <span className="form-optional">(one per line)</span></label>
        <textarea className="form-textarea" style={{ minHeight: 90 }}
          placeholder={"Currently enrolled in a relevant programme\nAvailable full-time for the duration"}
          value={form.requirements} onChange={e => set('requirements', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Skills <span className="form-optional">(comma-separated)</span></label>
        <input className="form-input" placeholder="Python, SQL, React"
          value={form.skills} onChange={e => set('skills', e.target.value)} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" placeholder="City or Remote"
            value={form.location} onChange={e => set('location', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Duration (months)</label>
          <input className="form-input" type="number" min={1} max={24}
            value={form.durationMonths} onChange={e => set('durationMonths', e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Stipend amount <span className="form-optional">(optional)</span></label>
          <input className="form-input" type="number" placeholder="25000"
            value={form.stipendAmount} onChange={e => set('stipendAmount', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Currency</label>
          <select className="form-input" value={form.stipendCurrency}
            onChange={e => set('stipendCurrency', e.target.value)}>
            {['USD', 'KES', 'ZAR', 'NGN', 'GHS', 'EUR', 'GBP'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Min year of study</label>
          <select className="form-input" value={form.minYear}
            onChange={e => set('minYear', e.target.value)}>
            {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Max year of study</label>
          <select className="form-input" value={form.maxYear}
            onChange={e => set('maxYear', e.target.value)}>
            {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Application Deadline</label>
        <input className="form-input" type="date"
          value={form.deadline} onChange={e => set('deadline', e.target.value)} />
      </div>

      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input type="checkbox" id="remote" checked={form.remote}
          onChange={e => set('remote', e.target.checked)} style={{ width: 16, height: 16 }} />
        <label htmlFor="remote" className="form-label" style={{ margin: 0 }}>Remote position</label>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button className="btn-ghost" onClick={() => router.push('/internships')}>Cancel</button>
        <button className="btn-primary" disabled={submitting} onClick={submit}>
          {submitting ? 'Submitting…' : 'Submit for review'}
        </button>
      </div>
    </div>
  )
}
