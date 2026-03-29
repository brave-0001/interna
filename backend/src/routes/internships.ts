import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../lib/db.js'
import { auth, requireRole } from '../middleware/auth.js'
import { computeMatchScore } from '../services/matchScore.js'

export const internships = new Hono()

const listQuery = z.object({
  field:    z.string().optional(),
  location: z.string().optional(),
  duration: z.coerce.number().optional(),
  remote:   z.enum(['true', 'false']).optional(),
  search:   z.string().optional(),
  sort:     z.enum(['match', 'deadline', 'stipend']).default('match'),
  page:     z.coerce.number().default(1),
  limit:    z.coerce.number().max(50).default(20),
})

const createSchema = z.object({
  title:           z.string().min(3).max(120),
  field:           z.string().min(2),
  description:     z.string().min(20),
  requirements:    z.array(z.string()).min(1),
  skills:          z.array(z.string()).min(1),
  location:        z.string().min(2),
  remote:          z.boolean().default(false),
  durationMonths:  z.number().int().min(1).max(24),
  stipendAmount:   z.number().positive().optional(),
  stipendCurrency: z.string().length(3).optional(),
  minYear:         z.number().int().min(1).max(4).default(1),
  maxYear:         z.number().int().min(1).max(4).default(4),
  deadline:        z.string().datetime(),
})

internships.get('/', zValidator('query', listQuery), async (c) => {
  const q      = c.req.valid('query')
  const clerkId = c.req.header('x-clerk-user-id')
  const offset  = (q.page - 1) * q.limit

  const where: Record<string, unknown> = { status: 'APPROVED' }
  if (q.field)    where.field    = q.field
  if (q.location) where.location = q.location
  if (q.duration) where.durationMonths = q.duration
  if (q.remote === 'true') where.remote = true
  if (q.search)   where.OR = [
    { title:       { contains: q.search, mode: 'insensitive' } },
    { description: { contains: q.search, mode: 'insensitive' } },
  ]

  const [items, total] = await Promise.all([
    db.internship.findMany({
      where,
      include: { company: { select: { name: true, logoUrl: true, industry: true } } },
      orderBy: q.sort === 'deadline' ? { deadline: 'asc' }
             : q.sort === 'stipend'  ? { stipendAmount: 'desc' }
             : { createdAt: 'desc' },
      skip: offset,
      take: q.limit,
    }),
    db.internship.count({ where }),
  ])

  let student: { course: string; yearOfStudy: number; skills: string[] } | null = null
  if (clerkId) {
    const u = await db.user.findUnique({
      where:   { clerkId },
      include: { student: { select: { course: true, yearOfStudy: true, skills: true } } },
    })
    student = u?.student ?? null
  }

  const data = items.map(i => ({
    ...i,
    matchScore: student ? computeMatchScore({ student, internship: i }) : null,
  }))

  if (q.sort === 'match' && student) {
    data.sort((a, b) => (b.matchScore?.total ?? 0) - (a.matchScore?.total ?? 0))
  }

  return c.json({ data, total, page: q.page, limit: q.limit })
})

internships.get('/:id', async (c) => {
  const item = await db.internship.findUnique({
    where:   { id: c.req.param('id'), status: 'APPROVED' },
    include: { company: { select: { name: true, logoUrl: true, website: true, industry: true, description: true } } },
  })
  if (!item) return c.json({ error: 'Not found' }, 404)
  return c.json(item)
})

internships.post('/', auth, requireRole('COMPANY'), zValidator('json', createSchema), async (c) => {
  const user    = c.get('user')
  const body    = c.req.valid('json')
  const company = await db.company.findUnique({ where: { userId: user.id } })
  if (!company) return c.json({ error: 'Company profile not found' }, 404)
  const item = await db.internship.create({
    data: { ...body, deadline: new Date(body.deadline), companyId: company.id, status: 'PENDING' },
  })
  return c.json(item, 201)
})

internships.patch(
  '/:id/status',
  auth,
  requireRole('ADMIN'),
  zValidator('json', z.object({ status: z.enum(['APPROVED', 'REJECTED', 'CLOSED']) })),
  async (c) => {
    const item = await db.internship.update({
      where: { id: c.req.param('id') },
      data:  { status: c.req.valid('json').status },
    })
    return c.json(item)
  }
)
