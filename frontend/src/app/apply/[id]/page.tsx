'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { applicationApi } from '@/lib/api'

type Props = { params: { id: string } }

export default function ApplyPage({ params }: Props) {
  const router           = useRouter()
  const { user }         = useUser()
  const [step, setStep]  = useState<1 | 2>(1)
  const [cvUrl, setCvUrl]               = useState<string | null>(null)
  const [coverLetter, setCoverLetter]   = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [done, setDone]                 = useState(false)
  const [error, setError]               = useState<string | null>(null)

  const handleFile = useCallback(async (file: File) => {
    // Replace with real R2 signed URL upload in production
    await new Promise(r => setTimeout(r, 600))
    setCvUrl(`https://uploads.interna.app/${user?.id}/${file.name}`)
  }, [user])

  const submit = useCallback(async () => {
    if (!user || !cvUrl) return
    setSubmitting(true)
    setError(null)
    try {
      await applicationApi.submit(
        { internshipId: params.id, cvUrl, coverLetter: coverLetter || undefined },
        user.id
      )
      setDone(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }, [user, cvUrl, coverLetter, params.id])

  if (done) {
    return (
      <div className="apply-wrap">
        <div className="success-state">
          <div className="success-icon">✓</div>
          <h2 className="success-title">Application sent</h2>
          <p className="success-sub">
            Your application has been submitted. Track its status in your dashboard.
          </p>
          <Link href="/dashboard" className="btn-primary">View dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="apply-wrap">
      <Link href={`/internships/${params.id}`} className="back-btn">← Back</Link>

      <p className="apply-eyebrow">Step {step} of 2</p>
      <h1 className="apply-title">
        {step === 1 ? 'Upload your CV' : 'Cover letter'}
      </h1>
      <p className="apply-sub">
        {step === 1
          ? 'Your CV will be shared with the company.'
          : 'Optional — keep it specific and under 300 words.'}
      </p>

      <div className="step-dots">
        {([1, 2] as const).map(n => (
          <div
            key={n}
            className={`step-dot ${step === n ? 'active' : step > n ? 'done' : ''}`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="form-group">
          <label className="form-label">CV / Résumé</label>
          <label className={`upload-zone${cvUrl ? ' has-file' : ''}`}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            <div className="upload-icon">{cvUrl ? '📄' : '⬆'}</div>
            <p className={cvUrl ? 'upload-name' : 'upload-text'}>
              {cvUrl ? cvUrl.split('/').pop() : 'Click to upload PDF or DOCX'}
            </p>
            {!cvUrl && <p className="upload-text" style={{ fontSize: 11, marginTop: 4 }}>Max 5MB</p>}
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button className="btn-ghost" onClick={() => router.back()}>Cancel</button>
            <button className="btn-primary" disabled={!cvUrl} onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <>
          <div className="form-group">
            <label className="form-label">
              Cover letter <span className="form-optional">(optional)</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="What draws you to this role? What will you bring?"
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              maxLength={2000}
            />
            <p className="form-hint">{coverLetter.length} / 2000</p>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-primary" disabled={submitting} onClick={submit}>
              {submitting ? 'Submitting…' : 'Submit application'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
