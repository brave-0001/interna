import { createMiddleware } from 'hono/factory'
import { db } from '../lib/db.js'

type AuthUser = { id: string; clerkId: string; role: string }

declare module 'hono' {
  interface ContextVariableMap { user: AuthUser }
}

export const auth = createMiddleware(async (c, next) => {
  const clerkId = c.req.header('x-clerk-user-id')
  if (!clerkId) return c.json({ error: 'Unauthorised' }, 401)

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true, clerkId: true, role: true },
  })
  if (!user) return c.json({ error: 'User not found' }, 404)

  c.set('user', user)
  await next()
})

export const requireRole = (...roles: string[]) =>
  createMiddleware(async (c, next) => {
    const user = c.get('user')
    if (!roles.includes(user.role)) return c.json({ error: 'Forbidden' }, 403)
    await next()
  })
