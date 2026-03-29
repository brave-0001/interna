import { Suspense } from 'react'
import { ProfileBanner } from '@/components/ProfileBanner'
import { InternshipGrid } from '@/components/InternshipGrid'

export const metadata = { title: 'Discover Internships · Interna' }

export default function InternshipsPage() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Internships · Attachments · Opportunities</p>
        <h1 className="hero-title">
          Find work that <em>fits</em> where you are.
        </h1>
        <p className="hero-sub">
          Your field, your skills, your year — scored and sorted so you decide in seconds.
        </p>
      </section>

      <ProfileBanner />

      <Suspense>
        <InternshipGrid />
      </Suspense>
    </main>
  )
}
