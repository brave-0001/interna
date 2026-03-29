'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSignUp } from '@clerk/nextjs'
import { userApi } from '@/lib/api'

export default function SignUpPage() {
  const router = useRouter()
  const { signUp, setActive, isLoaded } = useSignUp()

  const [role, setRole]         = useState<'STUDENT' | 'COMPANY' | null>(null)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode]         = useState('')
  const [step, setStep]         = useState<'role' | 'details' | 'verify'>('role')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const handleSignUp = async () => {
    if (!isLoaded || !role) return
    setLoading(true)
    setError(null)
    try {
      await signUp.create({ emailAddress: email, password })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setStep('verify')
    } catch (err: unknown) {
      setError((err as { errors?: { message: string }[] }).errors?.[0]?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!isLoaded || !role) return
    setLoading(true)
    setError(null)
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        await userApi.syncUser({
          clerkId: result.createdUserId!,
          email,
          role,
        })
        router.push('/internships')
      }
    } catch (err: unknown) {
      setError((err as { errors?: { message: string }[] }).errors?.[0]?.message ?? 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="apply-wrap" style={{ paddingTop: 64 }}>

      {step === 'role' && (
        <>
          <p className="eyebrow">Create account</p>
          <h1 className="apply-title">I am joining as...</h1>
          <p className="apply-sub" style={{ marginBottom: 32 }}>
            Choose your account type. You cannot change this later.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 32 }}>
            <button
              onClick={() => setRole('STUDENT')}
              style={{
                padding: '28px 20px',
                borderRadius: 14,
                border: `2px solid ${role === 'STUDENT' ? 'var(--cp)' : 'var(--cb)'}`,
                background: role === 'STUDENT' ? 'rgba(129,157,159,0.08)' : 'var(--cc)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>🎓</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ct)', marginBottom: 4 }}>Student</div>
              <div style={{ fontSize: 12, color: 'var(--cts)' }}>Find and apply to internships</div>
            </button>

            <button
              onClick={() => setRole('COMPANY')}
              style={{
                padding: '28px 20px',
                borderRadius: 14,
                border: `2px solid ${role === 'COMPANY' ? 'var(--cp)' : 'var(--cb)'}`,
                background: role === 'COMPANY' ? 'rgba(129,157,159,0.08)' : 'var(--cc)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>🏢</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ct)', marginBottom: 4 }}>Organisation</div>
              <div style={{ fontSize: 12, color: 'var(--cts)' }}>Post internships and find talent</div>
            </button>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={!role}
            onClick={() => setStep('details')}
          >
            Continue →
          </button>
        </>
      )}

      {step === 'details' && (
        <>
          <p className="eyebrow">{role === 'STUDENT' ? 'Student' : 'Organisation'} account</p>
          <h1 className="apply-title">Create your account</h1>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button className="btn-ghost" onClick={() => setStep('role')}>← Back</button>
            <button className="btn-primary" disabled={loading || !email || !password} onClick={handleSignUp}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </>
      )}

      {step === 'verify' && (
        <>
          <p className="eyebrow">Verify email</p>
          <h1 className="apply-title">Check your inbox</h1>
          <p className="apply-sub">We sent a 6-digit code to {email}</p>

          <div className="form-group">
            <label className="form-label">Verification code</label>
            <input
              className="form-input"
              type="text"
              placeholder="000000"
              value={code}
              onChange={e => setCode(e.target.value)}
              style={{ letterSpacing: '0.2em', fontSize: 20, textAlign: 'center' }}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading || code.length < 6}
            onClick={handleVerify}
          >
            {loading ? 'Verifying…' : 'Verify & continue'}
          </button>
        </>
      )}
    </div>
  )
}