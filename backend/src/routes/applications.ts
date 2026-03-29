import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../lib/db.js'
import { auth, requireRole } from '../middleware/auth.js'

export const applications = new Hono()

const submitSchema = z.object({
  internshipId: z.string().cuid(),
  cvUrl:        z.string().url(),
  coverLetter:  z.string().max(2000).optional(),
})

applications.post('/', auth, requireRole('STUDENT'), zValidator('json', submitSchema), async (c) => {
  const user    = c.get('user')
  const body    = c.req.valid('json')
  const student = await db.student.findUnique({ where: { userId: user.id } })
  if (!student) return c.json({ error: 'Student profile not found' }, 404)

  const internship = await db.internship.findUnique({
    where: { id: body.internshipId, status: 'APPROVED' },
  })
  if (!internship) return c.json({ error: 'Internship not found or closed' }, 404)
  if (new Date() > internship.deadline) return c.json({ error: 'Deadline has passed' }, 422)

  const existing = await db.application.findUnique({
    where: { studentId_internshipId: { studentId: student.id, internshipId: body.internshipId } },
  })
  if (existing) return c.json({ error: 'Already applied' }, 409)

  const app = await db.application.create({
    data: {
      studentId:    student.id,
      internshipId: body.internshipId,
      cvUrl:        body.cvUrl,
      coverLetter:  body.coverLetter,
    },
  })
  return c.json(app, 201)
})

applications.get('/mine', auth, requireRole('STUDENT'), async (c) => {
  const user    = c.get('user')
  const student = await db.student.findUnique({ where: { userId: user.id } })
  if (!student) return c.json({ error: 'Student profile not found' }, 404)

  const apps = await db.application.findMany({
    where:   { studentId: student.id },
    include: {
      internship: {
        select: {
          title: true, deadline: true, location: true, durationMonths: true,
          company: { select: { name: true, logoUrl: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return c.json(apps)
})

applications.get('/internship/:id', auth, requireRole('COMPANY'), async (c) => {
  const user    = c.get('user')
  const company = await db.company.findUnique({ where: { userId: user.id } })
  if (!company) return c.json({ error: 'Company profile not found' }, 404)

  const internship = await db.internship.findUnique({
    where: { id: c.req.param('id'), companyId: company.id },
  })
  if (!internship) return c.json({ error: 'Listing not found' }, 404)

  const apps = await db.application.findMany({
    where:   { internshipId: internship.id },
    include: {
      student: {
        select: { name: true, university: true, course: true, yearOfStudy: true, skills: true, cvUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return c.json(apps)
})

applications.patch(
  '/:id/status',
  auth,
  requireRole('COMPANY'),
  zValidator('json', z.object({ status: z.enum(['UNDER_REVIEW', 'ACCEPTED', 'REJECTED']) })),
  async (c) => {
    const user    = c.get('user')
    const company = await db.company.findUnique({ where: { userId: user.id } })
    if (!company) return c.json({ error: 'Company profile not found' }, 404)

    const app = await db.application.findUnique({
      where:   { id: c.req.param('id') },
      include: { internship: { select: { companyId: true } } },
    })
    if (!app || app.internship.companyId !== company.id) {
      return c.json({ error: 'Application not found' }, 404)
    }
    const updated = await db.application.update({
      where: { id: app.id },
      data:  { status: c.req.valid('json').status },
    })
    return c.json(updated)
  }
)
