# منصة تقييم حاضنة الذكاء الاصطناعي — Web (Phase 0)

The real backend for the KAU AI Incubator evaluation platform — Next.js 16
(App Router, TypeScript, Turbopack) + Drizzle ORM + Neon Postgres + better-auth.
This replaces the in-memory `prototype/` with a persistent, authenticated app.

See [../PLAN.md](../PLAN.md) for the full roadmap. This directory is **Phase 0**:
the scaffold and foundations.

## What's here

```
src/
  app/
    layout.tsx              RTL Arabic shell, IBM Plex Sans Arabic
    page.tsx                Phase 0 status landing
    api/auth/[...all]/      better-auth route handler
    api/health/             DB connectivity check
  db/
    schema.ts               Full Drizzle schema (auth + domain tables)
    index.ts                Neon-backed db client
    seed.ts                 Seeds the first admin (idempotent)
  lib/
    env.ts                  Zod-validated server env (fails fast)
    auth.ts                 better-auth config (email/password, roles, rate limit)
    auth-client.ts          React client (signIn/signOut/useSession)
    rbac.ts                 requireUser / requireRole guards for handlers
drizzle.config.ts           drizzle-kit config
```

## Setup

1. **Database** — create a project at [neon.tech](https://neon.tech) and copy the
   pooled connection string.
2. **Env** — `cp .env.example .env.local` and fill in `DATABASE_URL`,
   `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), and `ANTHROPIC_API_KEY`.
3. **Install** — `pnpm install`
4. **Migrate** — push the schema to your database:
   ```bash
   pnpm db:generate   # generate SQL migration from schema.ts
   pnpm db:migrate    # apply it  (or: pnpm db:push for dev)
   ```
5. **Seed admin** — `pnpm db:seed` (reads SEED_ADMIN_* from .env.local)
6. **Run** — `pnpm dev` -> http://localhost:3000

## Verify

- `GET /api/health` -> `{ status: "ok", db: "connected" }` once Neon is wired
- `GET /api/auth/get-session` -> `null` until you sign in

## Auth model

Email/password only, **invite-only** in the UI. Roles (`admin`, `evaluator`,
`investor`, `student`) live on the user row and are **enforced server-side** via
`requireRole(...)` in every protected handler — never trusted from the client.

## Features (Phases 0–3)

- **Auth & RBAC** — better-auth email/password, four roles enforced server-side.
- **Projects** — CRUD, student self-submission, admin/evaluator management.
- **AI evaluation** — `claude-opus-4-8` via forced tool use produces structured
  scores/decision/strengths/weaknesses/recommendations + action plan; heuristic
  fallback when the key is absent. Report page renders it all.
- **Excel import** — upload xlsx/csv → `claude-haiku-4-5` extracts project rows →
  review → bulk insert.
- **Dashboard** — live decision donut + per-sector averages.
- **Report email** — Resend (optional; degrades gracefully when unconfigured).
- **Admin** — user management, audit log on every mutation.

## Deploying to Vercel

This app lives in the `web/` subdirectory of the repo.

1. **Push** the branch to GitHub.
2. In Vercel: **New Project → import the repo**, and set **Root Directory = `web`**
   (critical — the project is not at the repo root). Framework auto-detects as
   Next.js; no `vercel.json` needed.
3. **Environment variables** (Project → Settings → Environment Variables) — add the
   same keys as `.env.local`:
   - `DATABASE_URL` — your Neon **pooled** connection string
   - `BETTER_AUTH_SECRET` — `openssl rand -base64 32`
   - `BETTER_AUTH_URL` — your production URL, e.g. `https://your-app.vercel.app`
   - `ANTHROPIC_API_KEY`
   - `RESEND_API_KEY` + `RESEND_FROM` (optional)
   - `SEED_ADMIN_*` (only if you run the seed against prod)
4. **Trusted origin** — add your production URL to `trustedOrigins` in
   [src/lib/auth.ts](src/lib/auth.ts) so sign-in passes the origin check.
5. **Migrate prod** — run `pnpm db:migrate` locally against the prod
   `DATABASE_URL` (or use Neon branching), then `pnpm db:seed` once for the admin.
6. **Deploy.** Vercel builds with Turbopack; `/api/health` should return
   `{ status: "ok", db: "connected" }`.

> Neon also offers a native Vercel integration that injects `DATABASE_URL`
> automatically — optional, the manual variable works fine.
