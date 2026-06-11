import { z } from 'zod';
import { db } from '@/db';
import { project } from '@/db/schema';
import { requireRole, toErrorResponse } from '@/lib/rbac';
import { nextProjectCode, logAudit } from '@/lib/projects';

const confirmBody = z.object({
  projects: z
    .array(
      z.object({
        name: z.string().min(2).max(200),
        sector: z.string().min(1).max(100),
        description: z.string().min(1).max(5000),
        stage: z.string().max(100).optional(),
        teamSize: z.number().int().min(1).max(100).optional(),
        fundingAsk: z.string().max(200).optional(),
      }),
    )
    .min(1)
    .max(50),
});

// POST /api/imports/confirm — persist the reviewed/extracted projects.
export async function POST(req: Request) {
  try {
    const user = await requireRole('admin', 'evaluator');
    const parsed = confirmBody.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: 'validation', issues: parsed.error.issues }, { status: 422 });
    }

    const created: { id: string; code: string }[] = [];
    for (const p of parsed.data.projects) {
      const code = await nextProjectCode();
      const [row] = await db
        .insert(project)
        .values({
          ...p,
          code,
          status: 'submitted',
          source: 'import',
          createdBy: user.id,
        })
        .returning({ id: project.id, code: project.code });
      created.push(row);
    }

    await logAudit(user.id, 'project.import', 'project', created[0]?.id ?? '', { count: created.length });
    return Response.json({ created: created.length, projects: created }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
