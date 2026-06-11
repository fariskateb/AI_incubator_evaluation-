import { z } from 'zod';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { project, evaluation, emailLog } from '@/db/schema';
import { requireRole, toErrorResponse } from '@/lib/rbac';
import { logAudit } from '@/lib/projects';
import { sendEmail, buildReportHtml } from '@/lib/email';

const body = z.object({ to: z.string().email() });

// POST /api/projects/:id/email — email the latest evaluation report. Admin/evaluator.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireRole('admin', 'evaluator');
    const parsed = body.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'بريد غير صالح' }, { status: 422 });

    const [row] = await db.select().from(project).where(and(eq(project.id, id), isNull(project.deletedAt)));
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

    const [latest] = await db
      .select().from(evaluation).where(eq(evaluation.projectId, id))
      .orderBy(desc(evaluation.createdAt)).limit(1);
    if (!latest) return Response.json({ error: 'لا يوجد تقييم لإرساله' }, { status: 400 });

    const subject = `تقرير تقييم المشروع: ${row.name} (${row.code})`;
    const html = buildReportHtml({
      name: row.name, code: row.code, totalScore: latest.totalScore, decision: latest.decision,
      criteria: latest.criteria, strengths: latest.strengths, weaknesses: latest.weaknesses,
      recommendations: latest.recommendations,
    });

    const result = await sendEmail(parsed.data.to, subject, html);

    await db.insert(emailLog).values({
      projectId: id,
      toEmail: parsed.data.to,
      subject,
      status: result.ok ? 'sent' : result.skipped ? 'skipped' : 'failed',
      providerId: result.providerId ?? null,
      createdBy: user.id,
    });
    await logAudit(user.id, 'project.email', 'project', id, { to: parsed.data.to, status: result.ok ? 'sent' : 'failed' });

    if (result.skipped) {
      return Response.json({ ok: false, skipped: true, message: 'خدمة البريد غير مُهيّأة (RESEND_API_KEY). أضِف المفتاح لتفعيل الإرسال.' }, { status: 200 });
    }
    if (!result.ok) return Response.json({ error: result.error ?? 'تعذّر الإرسال' }, { status: 502 });
    return Response.json({ ok: true, providerId: result.providerId });
  } catch (err) {
    return toErrorResponse(err);
  }
}
