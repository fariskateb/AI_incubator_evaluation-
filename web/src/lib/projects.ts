import { db } from '@/db';
import { project, auditLog } from '@/db/schema';
import { sql } from 'drizzle-orm';

/** Generate the next sequential project code (INC-NNN). */
export async function nextProjectCode(): Promise<string> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(project);
  return `INC-${String(count + 1).padStart(3, '0')}`;
}

export async function logAudit(actorId: string, action: string, entityType: string, entityId: string, meta?: unknown) {
  await db.insert(auditLog).values({ actorId, action, entityType, entityId, meta: meta ?? null });
}
