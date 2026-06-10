import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { user as userTable } from '@/db/schema';
import { auth } from '@/lib/auth';
import { requireRole, toErrorResponse } from '@/lib/rbac';
import { logAudit } from '@/lib/projects';

const createUser = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'evaluator', 'investor', 'student']),
});

// GET /api/admin/users — list all users (admin only).
export async function GET() {
  try {
    await requireRole('admin');
    const rows = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        role: userTable.role,
        banned: userTable.banned,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .orderBy(userTable.createdAt);
    return Response.json({ users: rows });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// POST /api/admin/users — create a user with a role (invite-equivalent until
// email invitations land in Phase 3). Admin only.
export async function POST(req: Request) {
  try {
    const admin = await requireRole('admin');
    const parsed = createUser.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: 'validation', issues: parsed.error.issues }, { status: 422 });
    }
    const { name, email, password, role } = parsed.data;

    const existing = await db.query.user.findFirst({ where: eq(userTable.email, email) });
    if (existing) return Response.json({ error: 'البريد مسجّل بالفعل' }, { status: 409 });

    // Create through better-auth so the password is hashed correctly.
    await auth.api.signUpEmail({ body: { email, password, name } });
    const [row] = await db
      .update(userTable)
      .set({ role, emailVerified: true })
      .where(eq(userTable.email, email))
      .returning({ id: userTable.id, name: userTable.name, email: userTable.email, role: userTable.role });

    await logAudit(admin.id, 'user.create', 'user', row.id, { role });
    return Response.json({ user: row }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
