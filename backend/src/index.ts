import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { internships } from './routes/internships.js'
import { applications } from './routes/applications.js'
import { users } from './routes/users.js'

const app = new Hono()

app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors({
  origin:      process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
}))

app.get('/health', c => c.json({ status: 'ok', ts: new Date().toISOString() }))

app.route('/users',        users)
app.route('/internships',  internships)
app.route('/applications', applications)

app.notFound(c => c.json({ error: 'Not found' }, 404))
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

const port = Number(process.env.PORT ?? 8080)
serve({ fetch: app.fetch, port }, () => {
  console.log(`▲ interna api  http://localhost:${port}`)
})
