import { db } from '@/db';
import { project } from '@/db/schema';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { requireUser, requireRole, toErrorResponse } from '@/lib/rbac';
import { projectInput } from '@/lib/validation';
import { nextProjectCode, logAudit } from '@/lib/projects';

// GET /api/projects — list (students see only their own).
export async function GET() {
  try {
    const user = await requireUser();
    const where =
      user.role === 'student'
        ? and(isNull(project.deletedAt), eq(project.ownerId, user.id))
        : isNull(project.deletedAt);
    const rows = await db.select().from(project).where(where).orderBy(desc(project.createdAt));
    return Response.json({ projects: rows });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/projects — create. Admin/evaluator create any; students create their own.
export async function POST(req: Request) {
  try {
    const user = await requireRole('admin', 'evaluator', 'student');
    const body = await req.json();
    const parsed = projectInput.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'validation', issues: parsed.error.issues }, { status: 422 });
    }
    const code = await nextProjectCode();
    const [row] = await db
      .insert(project)
      .values({
        ...parsed.data,
        code,
        status: 'submitted',
        source: user.role === 'student' ? 'student' : 'form',
        ownerId: user.role === 'student' ? user.id : null,
        createdBy: user.id,
      })
      .returning();
    await logAudit(user.id, 'project.create', 'project', row.id, { code });
    return Response.json({ project: row }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
