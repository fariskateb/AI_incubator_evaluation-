import { sql } from 'drizzle-orm';
import { db } from '@/db';

export const dynamic = 'force-dynamic';

// Liveness + DB connectivity check. Returns 200 only if Postgres responds.
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
  } catch (err) {
    return Response.json(
      { status: 'error', db: 'unreachable', message: err instanceof Error ? err.message : 'unknown' },
      { status: 503 },
    );
  }
}
