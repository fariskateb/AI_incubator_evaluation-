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

## Next (Phase 1+)

Login/invite UI, admin user management, project CRUD, server-side Claude
evaluation, and the dashboard — porting the screens from `prototype/`.
