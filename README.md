# Interna

A minimal platform where students find and apply to internships. Built with Next.js 14, Hono, PostgreSQL, Prisma, and Clerk.

---

## Structure

```
interna/
├── frontend/   Next.js 14 (App Router)
└── backend/    Hono + Prisma + PostgreSQL
```

---

## Prerequisites

- Node.js 20+
- PostgreSQL (local or Railway)
- Clerk account → https://clerk.com
- Cloudflare R2 bucket (for CV uploads)

---

## Backend setup

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL and other vars in .env

npm install
npx prisma generate
npx prisma db push       # creates tables
npm run dev              # starts on :8080
```

### Backend environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (default 8080) |
| `FRONTEND_URL` | Used for CORS (e.g. http://localhost:3000) |
| `CLERK_WEBHOOK_SECRET` | From Clerk dashboard → Webhooks |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | Public URL for uploaded files |

---

## Frontend setup

```bash
cd frontend
cp .env.example .env.local
# Fill in Clerk keys from https://dashboard.clerk.com

npm install
npm run dev              # starts on :3000
```

### Frontend environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL (e.g. http://localhost:8080) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/internships` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/internships` |

---

## Clerk webhook

Create a webhook in your Clerk dashboard pointing to:
```
POST https://your-api-domain.com/users/sync
```

Events to enable: `user.created`

This syncs new users into the database with their role (STUDENT or COMPANY).

---

## Screens

| Route | Who | What |
|---|---|---|
| `/internships` | Everyone | Discovery — browse, filter, match scores |
| `/internships/[id]` | Everyone | Detail — full listing, apply bar |
| `/apply/[id]` | Students | 2-step application form |
| `/dashboard` | Students | Application tracker with status |
| `/company/post` | Companies | Post a new internship listing |

---

## API routes

### Users
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/users/sync` | None | Clerk webhook — creates user |
| GET | `/users/me` | Any | Current user + profile |
| PUT | `/users/me/student` | Student | Create/update student profile |
| PUT | `/users/me/company` | Company | Create/update company profile |

### Internships
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/internships` | Optional | List with filters + match score |
| GET | `/internships/:id` | None | Single listing |
| POST | `/internships` | Company | Create listing (status: PENDING) |
| PATCH | `/internships/:id/status` | Admin | Approve / reject / close |

### Applications
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/applications` | Student | Submit application |
| GET | `/applications/mine` | Student | Own applications |
| GET | `/applications/internship/:id` | Company | Applicants for a listing |
| PATCH | `/applications/:id/status` | Company | Update application status |

---

## Match Score logic

```
Field match   → 0–40 pts  (exact course match = 40, related field = 24)
Skill overlap → 0–35 pts  (proportional to % of internship skills matched)
Year of study → 0–25 pts  (within internship year range = 25)

Total: capped at 99
```

Score tiers:
- 90–99 → Strong match
- 70–89 → Good match
- 40–69 → Moderate
- 0–39  → Low match

---

## Deploy

**Frontend → Vercel**
```bash
vercel --prod
```
Add all `NEXT_PUBLIC_*` and `CLERK_SECRET_KEY` as environment variables.

**Backend → Railway**
- Create a Railway project
- Add a PostgreSQL service
- Deploy the backend service, set all env vars
- Run `npx prisma db push` via Railway shell after first deploy

---

## Mobile (future)

The Hono REST API is mobile-ready as-is. When building the React Native app:
- Same endpoints, same auth header (`x-clerk-user-id`)
- Clerk has an Expo SDK — drop-in replacement
- No backend changes needed
