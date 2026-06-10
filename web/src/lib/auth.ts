import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import { env } from '@/lib/env';

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  // Accept requests from the configured URL plus local dev ports (the preview
  // harness may serve on 3100). Add your production origin here when deploying.
  trustedOrigins: [
    env.BETTER_AUTH_URL,
    'http://localhost:3000',
    'http://localhost:3100',
  ],
  database: drizzleAdapter(db, { provider: 'pg' }),
  // Invite-only: no open sign-up in the UI. Students are created via
  // invitation acceptance; staff are invited by an admin. Email/password
  // is the only credential method.
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'student', input: false },
      banned: { type: 'boolean', defaultValue: false, input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },
});

export type Session = typeof auth.$Infer.Session;
