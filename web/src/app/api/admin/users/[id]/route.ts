import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { user as userTable } from '@/db/schema';
import { requireRole, toErrorResponse } from '@/lib/rbac';
import { logAudit } from '@/lib/projects';

const patch = z.object({
  role: z.enum(['admin', 'evaluator', 'investor', 'student']).optional(),
  banned: z.boolean().optional(),
});

// PATCH /api/admin/users/:id — change role or ban status (admin only).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const admin = await requireRole('admin');
    if (id === admin.id) {
      return Response.json({ error: 'لا يمكنك تعديل حسابك الخاص هنا' }, { status: 400 });
    }
    const parsed = patch.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: 'validation', issues: parsed.error.issues }, { status: 422 });
    }
    const [row] = await db
      .update(userTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(userTable.id, id))
      .returning({ id: userTable.id, role: userTable.role, banned: userTable.banned });
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
    await logAudit(admin.id, 'user.update', 'user', id, parsed.data);
    return Response.json({ user: row });
  } catch (err) {
    return toErrorResponse(err);
  }
}
