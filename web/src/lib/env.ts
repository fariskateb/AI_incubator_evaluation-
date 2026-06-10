import { z } from 'zod';

// Validate required server env once, at import time, with a clear error.
const schema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:3000'),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid or missing environment variables:\n${issues}\n\nCopy .env.example to .env.local and fill it in.`);
}

export const env = parsed.data;
