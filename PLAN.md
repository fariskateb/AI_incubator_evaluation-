# Improvement Plan — AI Incubator Evaluation Platform

Rebuild the current single-file `index.html` prototype into a production web application with a real backend, real authentication, and durable persistence — while keeping the existing feature set and Arabic-first RTL experience.

---

## 1. Where we are today

One 2,600-line HTML file containing all markup, CSS, and JS. Feature-rich UI (dashboard, project form, Excel import, rankings, compare, reports, action plans) but:

| Gap | Today | Consequence |
|---|---|---|
| Auth | Plaintext passwords hardcoded in source; role checks are CSS hiding | Anyone can view-source and log in as admin |
| Persistence | `localStorage` only | Data lives in one browser; no sharing, no backup, no multi-user |
| AI calls | Anthropic API key entered and stored in the browser | Key is exposed; usage uncontrollable |
| Email | EmailJS public key client-side | Spoofable, quota abuse |
| Backend | None | No validation, no audit trail, no access control |

## 2. Target architecture

**Recommended stack (Option A):**

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Frontend + backend in one codebase and one deploy; server-side AI calls; first-class Vercel hosting |
| UI | **Tailwind CSS v4 + shadcn/ui (Radix)** | RTL-capable (logical properties, `dir` support), fast to build the existing screens |
| Charts | **react-chartjs-2** (Chart.js) | Reuse the existing Chart.js configs with minimal rework |
| Database | **PostgreSQL** (Neon serverless) | Real relational persistence, free tier, branching for dev |
| ORM | **Drizzle ORM** | Type-safe schema + SQL migrations checked into git |
| Auth | **better-auth** (email/password + admin plugin) | DB-backed sessions, scrypt hashing, roles/banning, rate limiting built in |
| AI | **Anthropic TypeScript SDK, server-side only** | Key lives in env vars; structured outputs for reliable JSON scores |
| Email | **Resend + React Email** | Server-side report emails; replaces EmailJS |
| Files | **Vercel Blob** (or S3) | Store uploaded Excel files |
| Validation | **Zod** | One schema shared by forms, API, and DB writes |

**Alternatives considered:**
- **Option B — Supabase + Vite SPA:** fastest to stand up (managed auth/DB/storage), but role logic spreads across RLS policies and edge functions; easier to get authorization subtly wrong. Good fallback if you want minimal backend code.
- **Option C — FastAPI + React:** choose if you prefer Python on the server; costs you two codebases and two deploys.

**Topology:** Browser → Next.js (server components + route handlers) → Postgres / Anthropic API / Resend. No separate API service, no microservices — one app, one database.

## 3. Data model (Postgres via Drizzle)

```
users           id, name, email (unique), role enum(admin|evaluator|investor|student),
                banned, created_at, updated_at        ← base tables managed by better-auth
sessions / accounts / verifications                   ← better-auth
invitations     id, email, role, token_hash, invited_by, expires_at, accepted_at

projects        id, display_code, owner_id→users (student, nullable), name, sector,
                description, problem, target_audience, market_size, competitors,
                tech_stack, uses_ai, ai_description, stage, team_size, team_skills,
                revenue_model, funding_ask,
                status enum(draft|submitted|evaluating|evaluated|archived),
                source enum(form|import|student|legacy),
                created_by, created_at, updated_at, deleted_at

evaluations     id, project_id, kind enum(ai|heuristic|manual), model_id,
                total_score, decision enum(direct|conditional|develop|unsuitable),
                criteria jsonb, strengths jsonb, weaknesses jsonb,
                recommendations jsonb, raw_response, token_usage jsonb,
                created_by, created_at

action_plans    id, project_id, kind, phases jsonb, raw_response, created_by, created_at

import_jobs     id, filename, storage_path, status enum(uploaded|extracting|review|confirmed|failed),
                total_rows, processed_rows, error, created_by, created_at
import_rows     id, job_id, row_index, raw jsonb, extracted jsonb, status, project_id

email_log       id, project_id, to_email, subject, status, provider_id, created_by, created_at
audit_log       id, actor_id, action, entity_type, entity_id, meta jsonb, created_at
app_settings    key, value jsonb, updated_by, updated_at   (model choice, criteria weights, budgets)
```

Notes:
- `evaluations` is append-only — re-evaluating creates a new row, preserving history (the current app overwrites).
- Criteria scores stay `jsonb` for v1; weights configurable in `app_settings`.
- Soft-delete projects (`deleted_at`); hard delete is admin-only.

## 4. Authentication & authorization

**Flows**
- Email/password login → httpOnly secure session cookie (DB-backed, better-auth).
- **No open registration.** Admin invites staff (evaluator/investor) by email; invite link sets password. Student self-signup with email verification is an admin-toggleable setting.
- Password reset via emailed token. Rate limiting on login and reset endpoints.
- Every privileged action re-checks the role **server-side** (middleware + per-handler guard). UI hiding remains, but only as UX.

**Permission matrix**

| Capability | Admin | Evaluator | Investor | Student |
|---|:-:|:-:|:-:|:-:|
| Dashboard, rankings, compare, all reports | ✓ | ✓ | ✓ (read-only) | — |
| Create/edit/delete projects | ✓ | ✓ | — | own draft only |
| Trigger AI evaluation / action plan | ✓ | ✓ | — | auto on submit |
| Excel import / export | ✓ | ✓ | — | — |
| Email reports | ✓ | ✓ | — | — |
| Manage users, invitations, settings | ✓ | — | — | — |
| View own project + own report | ✓ | ✓ | ✓ | ✓ |

All mutations write to `audit_log`.

## 5. API surface (Next.js route handlers / server actions)

| Endpoint | Purpose |
|---|---|
| `/api/auth/*` | better-auth (login, logout, reset, invites) |
| `GET/POST /api/projects`, `GET/PATCH/DELETE /api/projects/:id` | CRUD with filtering + pagination |
| `POST /api/projects/:id/evaluations` | Run AI evaluation (SSE stream of progress) |
| `POST /api/projects/:id/action-plan` | Generate/regenerate action plan |
| `POST /api/imports` → `/extract` → `/confirm` | Upload xlsx → AI extraction with progress → review → commit |
| `GET /api/rankings?by=…`, `GET /api/compare?ids=…` | Computed in SQL, not in the browser |
| `POST /api/projects/:id/email` | Send report via Resend |
| `GET /api/export.(xlsx|json)` | Server-generated exports |
| `GET/POST/PATCH /api/admin/users`, `/api/admin/invitations`, `/api/admin/settings` | Admin only |

## 6. AI integration redesign

- `ANTHROPIC_API_KEY` is an env var; the browser never sees a key. Delete the key-entry settings UI.
- **Structured outputs via tool use** with a Zod-derived JSON schema for `{criteria, total_score, decision, strengths, weaknesses, recommendations}` — eliminates the current free-text JSON parsing.
- Model strategy (configurable in `app_settings`): **claude-sonnet-4-6** for evaluations and action plans; **claude-haiku-4-5** for Excel row extraction (cheap, parallel batches).
- Evaluation streams progress to the client over SSE; Excel batch extraction reports per-batch progress the same way.
- Port the existing `generateLocalEvaluation` / `fallbackExtract` as the **heuristic fallback** (`kind='heuristic'`) when the API is unavailable or budget is exhausted.
- Cost controls: token usage logged per call into `evaluations.token_usage`; monthly budget + per-user daily caps in `app_settings`.
- Prompts live in versioned code (`src/lib/ai/prompts.ts`), criteria weights in settings.

## 7. Frontend rebuild (page map)

| Current (index.html section) | New route |
|---|---|
| Landing screen | `/` |
| Login overlay | `/login` |
| `page-dashboard` | `/(app)/dashboard` |
| `page-add` | `/(app)/projects/new` (React Hook Form + Zod, draft autosave to DB) |
| `page-projects` | `/(app)/projects` |
| `page-import` (3-step wizard) | `/(app)/import` |
| `page-rankings` | `/(app)/rankings` |
| `page-compare` | `/(app)/compare` |
| `page-reports` + full report | `/(app)/projects/[id]/report` |
| `page-settings` | `/(app)/admin` (users, invitations, settings) |
| Student submit/view | `/(student)/submit`, `/(student)/my-project` |

RTL/Arabic: root `<html lang="ar" dir="rtl">`, Tailwind logical properties (`ms-/me-/ps-/pe-`), IBM Plex Sans Arabic via `next/font`. UI strings centralized in a dictionary module (Arabic-only v1, ready for English later).

## 8. Data migration from localStorage

1. In the old app: Settings → **Export JSON** (already implemented as `exportJSON()`).
2. New repo ships `scripts/migrate-legacy.ts`: reads that JSON, validates with Zod, maps old fields → `projects` + `evaluations(kind='legacy')` + `action_plans`, prints a per-record report.
3. Keep the old `index.html` on a `legacy` branch for reference; remove it from `main` at launch.

## 9. Security hardening checklist

- [ ] Passwords hashed (scrypt via better-auth); no credentials anywhere in source
- [ ] httpOnly + Secure + SameSite cookies; CSRF protection; session revocation on role change/ban
- [ ] RBAC enforced in every handler (deny by default), not in the UI
- [ ] Zod validation on all inputs server-side; file uploads checked for type/size; xlsx parsed server-side with a current SheetJS release
- [ ] Rate limits: login, password reset, AI endpoints
- [ ] Security headers + CSP; HTTPS only
- [ ] Secrets only in env vars (`.env.example` checked in, `.env` ignored)
- [ ] Audit log on all mutations; Postgres PITR/nightly backups
- [ ] Dependency audit in CI

## 10. Deployment & operations

- **Recommended:** Vercel (app) + Neon (Postgres) + Resend (email) + Vercel Blob (files). Preview deployments per PR; `main` → production. Free tiers cover pilot scale.
- **Self-host alternative** (if data residency requires it): Docker Compose — Next.js standalone + Postgres + Caddy (TLS) on a university VM; nightly `pg_dump` to object storage.
- CI (GitHub Actions): typecheck, lint, unit tests, Drizzle migration check, Playwright smoke, deploy.
- Seed script for demo data and the first admin account.

## 11. Testing

- **Unit (Vitest):** scoring mapper, heuristic fallback, Zod schemas, RBAC guard.
- **E2E (Playwright):** login per role; RBAC denial cases (investor cannot mutate, student sees only own project); create → evaluate (mocked AI) → report; import wizard with a fixture xlsx.
- AI calls mocked in tests; one tagged live smoke test run manually.

## 12. Phased roadmap

| Phase | Scope | Done means | Effort* |
|---|---|---|---|
| **0 — Scaffold** | Next.js + TS + Tailwind + shadcn, Drizzle + Neon, CI, envs, deploy pipeline | Hello-app deployed, DB migration runs in CI | 0.5–1 day |
| **1 — Auth & users** | better-auth, 4 roles, invitations, admin user management, RBAC middleware, audit log | All roles log in; admin invites/bans; server rejects unauthorized calls | 1–2 days |
| **2 — Projects & AI** | Project schema + CRUD, new-project form with DB autosave, server-side AI evaluation (structured output + heuristic fallback), report page, action plans | Student/evaluator can create → evaluate → view report end-to-end | 2–3 days |
| **3 — Import & analytics** | Excel upload + extraction wizard with progress, dashboard, rankings, compare, Resend report emails, exports | Feature parity with the old app | 2–3 days |
| **4 — Migrate & launch** | Legacy JSON migration, security pass (headers, rate limits, CSP), Playwright suite, backups, docs, production deploy | Old data imported; checklist in §9 fully green | 1–2 days |

\* Focused, AI-assisted development days. Total ≈ **7–11 days**.

## 13. Out of scope (future ideas)

Cohorts/batches as a first-class entity, bilingual AR/EN UI, PDF report generation, human-in-the-loop rubric overrides per evaluator, usage analytics dashboard, SSO (university IdP).

## Open decisions

1. **Hosting/data residency** — Vercel + Neon (fastest) vs self-hosted VM (if institutional policy requires it). Plan assumes Vercel.
2. **Student self-signup** — open with email verification, or invite-only? Plan defaults to admin-toggleable, off initially.
3. **Email domain** — Resend needs a verified sending domain (e.g. a university subdomain) for deliverability.
