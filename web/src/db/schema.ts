import { pgTable, text, timestamp, boolean, integer, jsonb, pgEnum, uuid } from 'drizzle-orm/pg-core';

// ── Enums ─────────────────────────────────────────────────────────────
export const roleEnum = pgEnum('role', ['admin', 'evaluator', 'investor', 'student']);
export const projectStatusEnum = pgEnum('project_status', ['draft', 'submitted', 'evaluating', 'evaluated', 'archived']);
export const projectSourceEnum = pgEnum('project_source', ['form', 'import', 'student', 'legacy']);
export const decisionEnum = pgEnum('decision', ['direct', 'conditional', 'develop', 'unsuitable']);
export const evaluationKindEnum = pgEnum('evaluation_kind', ['ai', 'heuristic', 'manual', 'legacy']);
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'expired']);

// ── better-auth core tables ───────────────────────────────────────────
// Field names match better-auth's expected Drizzle schema.
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  // Domain extension — role is enforced server-side, never trusted from the client.
  role: roleEnum('role').notNull().default('student'),
  banned: boolean('banned').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ── Domain tables ─────────────────────────────────────────────────────
export const invitation = pgTable('invitation', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  role: roleEnum('role').notNull(),
  tokenHash: text('token_hash').notNull(),
  invitedBy: text('invited_by').references(() => user.id),
  status: invitationStatusEnum('status').notNull().default('pending'),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const project = pgTable('project', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  ownerId: text('owner_id').references(() => user.id),
  name: text('name').notNull(),
  sector: text('sector').notNull(),
  description: text('description').notNull(),
  problem: text('problem'),
  targetAudience: text('target_audience'),
  marketSize: text('market_size'),
  competitors: text('competitors'),
  techStack: text('tech_stack'),
  usesAi: boolean('uses_ai'),
  aiDescription: text('ai_description'),
  stage: text('stage'),
  teamSize: integer('team_size'),
  teamSkills: text('team_skills'),
  revenueModel: text('revenue_model'),
  fundingAsk: text('funding_ask'),
  status: projectStatusEnum('status').notNull().default('draft'),
  source: projectSourceEnum('source').notNull().default('form'),
  createdBy: text('created_by').references(() => user.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Append-only: re-evaluating inserts a new row, preserving history.
export const evaluation = pgTable('evaluation', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => project.id, { onDelete: 'cascade' }),
  kind: evaluationKindEnum('kind').notNull().default('ai'),
  modelId: text('model_id'),
  totalScore: integer('total_score').notNull(),
  decision: decisionEnum('decision').notNull(),
  criteria: jsonb('criteria').$type<{ key: string; label: string; score: number; weight: number }[]>().notNull(),
  strengths: jsonb('strengths').$type<string[]>().notNull().default([]),
  weaknesses: jsonb('weaknesses').$type<string[]>().notNull().default([]),
  recommendations: jsonb('recommendations').$type<string[]>().notNull().default([]),
  rawResponse: text('raw_response'),
  tokenUsage: jsonb('token_usage').$type<{ input: number; output: number }>(),
  createdBy: text('created_by').references(() => user.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const actionPlan = pgTable('action_plan', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => project.id, { onDelete: 'cascade' }),
  kind: evaluationKindEnum('kind').notNull().default('ai'),
  phases: jsonb('phases').$type<{ phase: string; duration: string; items: string[] }[]>().notNull(),
  rawResponse: text('raw_response'),
  createdBy: text('created_by').references(() => user.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: text('actor_id').references(() => user.id),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  meta: jsonb('meta'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const appSettings = pgTable('app_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedBy: text('updated_by').references(() => user.id),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const emailLog = pgTable('email_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => project.id, { onDelete: 'cascade' }),
  toEmail: text('to_email').notNull(),
  subject: text('subject').notNull(),
  status: text('status').notNull(),
  providerId: text('provider_id'),
  createdBy: text('created_by').references(() => user.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type User = typeof user.$inferSelect;
export type Project = typeof project.$inferSelect;
export type Evaluation = typeof evaluation.$inferSelect;
