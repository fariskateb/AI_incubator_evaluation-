import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { project, evaluation, actionPlan } from '@/db/schema';
import { requireUser, AuthError, toErrorResponse } from '@/lib/rbac';
import { logAudit } from '@/lib/projects';
import { evaluateProject } from '@/lib/ai/evaluate';

// POST /api/projects/:id/evaluations — run an AI evaluation and persist it
// (append-only) plus its action plan. Admin/evaluator any project; a student
// may evaluate their own.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireUser();

    const [row] = await db.select().from(project).where(and(eq(project.id, id), isNull(project.deletedAt)));
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

    const canEvaluate =
      user.role === 'admin' || user.role === 'evaluator' || (user.role === 'student' && row.ownerId === user.id);
    if (!canEvaluate) throw new AuthError(403, 'Insufficient permissions');

    const result = await evaluateProject(row);

    const [evalRow] = await db
      .insert(evaluation)
      .values({
        projectId: id,
        kind: result.kind,
        modelId: result.modelId,
        totalScore: result.totalScore,
        decision: result.decision,
        criteria: result.criteria,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        recommendations: result.recommendations,
        rawResponse: result.rawResponse ?? null,
        tokenUsage: result.tokenUsage ?? null,
        createdBy: user.id,
      })
      .returning();

    await db.insert(actionPlan).values({
      projectId: id,
      kind: result.kind,
      phases: result.plan,
      createdBy: user.id,
    });

    await db.update(project).set({ status: 'evaluated', updatedAt: new Date() }).where(eq(project.id, id));
    await logAudit(user.id, 'project.evaluate', 'project', id, { kind: result.kind, totalScore: result.totalScore });

    return Response.json({ evaluation: evalRow }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
