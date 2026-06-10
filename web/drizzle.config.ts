import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Next.js uses .env.local; load it (falling back to .env) for drizzle-kit too.
config({ path: '.env.local' });
config();

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
