import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../lib/db.js'
import { auth } from '../middleware/auth.js'

export const users = new Hono()

const syncSchema = z.object({
  clerkId: z.string(),
  email:   z.string().email(),
  role:    z.enum(['STUDENT', 'COMPANY']),
})

const studentSchema = z.object({
  name:        z.string().min(2),
  university:  z.string().min(2),
  course:      z.string().min(2),
  yearOfStudy: z.number().int().min(1).max(7),
  skills:      z.array(z.string()).min(1).max(20),
  bio:         z.string().max(500).optional(),
})

const companySchema = z.object({
  name:        z.string().min(2),
  industry:    z.string().min(2),
  website:     z.string().url().optional(),
  description: z.string().max(1000).optional(),
})

users.post('/sync', zValidator('json', syncSchema), async (c) => {
  const { clerkId, email, role } = c.req.valid('json')
  const user = await db.user.upsert({
    where:  { clerkId },
    update: { email },
    create: { clerkId, email, role },
  })
  return c.json(user, 201)
})

users.get('/me', auth, async (c) => {
  const user = c.get('user')
  const full = await db.user.findUnique({
    where:   { id: user.id },
    include: { student: true, company: true },
  })
  return c.json(full)
})

users.put('/me/student', auth, zValidator('json', studentSchema), async (c) => {
  const user = c.get('user')
  if (user.role !== 'STUDENT') return c.json({ error: 'Forbidden' }, 403)
  const body = c.req.valid('json')
  const student = await db.student.upsert({
    where:  { userId: user.id },
    update: body,
    create: { ...body, userId: user.id },
  })
  return c.json(student)
})

users.put('/me/company', auth, zValidator('json', companySchema), async (c) => {
  const user = c.get('user')
  if (user.role !== 'COMPANY') return c.json({ error: 'Forbidden' }, 403)
  const body = c.req.valid('json')
  const company = await db.company.upsert({
    where:  { userId: user.id },
    update: body,
    create: { ...body, userId: user.id },
  })
  return c.json(company)
})
