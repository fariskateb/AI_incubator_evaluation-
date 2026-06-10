import { db } from '@/db';
import { project } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { requireUser, requireRole, AuthError, toErrorResponse } from '@/lib/rbac';
import { projectUpdate } from '@/lib/validation';
import { logAudit } from '@/lib/projects';

async function loadVisible(id: string, userId: string, role: string) {
  const [row] = await db.select().from(project).where(and(eq(project.id, id), isNull(project.deletedAt)));
  if (!row) throw new AuthError(401, 'Not found'); // 404-ish; keep simple
  if (role === 'student' && row.ownerId !== userId) throw new AuthError(403, 'Forbidden');
  return row;
}

// GET /api/projects/:id
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const row = await loadVisible(id, user.id, user.role);
    return Response.json({ project: row });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// PATCH /api/projects/:id — admin/evaluator only.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireRole('admin', 'evaluator');
    const body = await req.json();
    const parsed = projectUpdate.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'validation', issues: parsed.error.issues }, { status: 422 });
    }
    const [row] = await db
      .update(project)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(project.id, id), isNull(project.deletedAt)))
      .returning();
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
    await logAudit(user.id, 'project.update', 'project', id);
    return Response.json({ project: row });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// DELETE /api/projects/:id — soft delete, admin only.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireRole('admin');
    const [row] = await db
      .update(project)
      .set({ deletedAt: new Date() })
      .where(and(eq(project.id, id), isNull(project.deletedAt)))
      .returning();
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
    await logAudit(user.id, 'project.delete', 'project', id);
    return Response.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
