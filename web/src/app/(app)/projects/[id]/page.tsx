import { notFound } from 'next/navigation';
import { db } from '@/db';
import { project, evaluation } from '@/db/schema';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { requireSession } from '@/lib/session';
import { PageHeader } from '@/components/page-header';
import { Card, DecisionBadge, scoreTone } from '@/components/ui';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession();

  const [row] = await db.select().from(project).where(and(eq(project.id, id), isNull(project.deletedAt)));
  if (!row) notFound();
  if (user.role === 'student' && row.ownerId !== user.id) notFound();

  const [latest] = await db
    .select()
    .from(evaluation)
    .where(eq(evaluation.projectId, id))
    .orderBy(desc(evaluation.createdAt))
    .limit(1);

  const details: [string, string | null | undefined][] = [
    ['القطاع', row.sector],
    ['المرحلة', row.stage],
    ['حجم الفريق', row.teamSize ? String(row.teamSize) : null],
    ['طلب التمويل', row.fundingAsk],
    ['الفئة المستهدفة', row.targetAudience],
    ['حجم السوق', row.marketSize],
    ['نموذج الإيرادات', row.revenueModel],
    ['المنافسون', row.competitors],
    ['استخدام الذكاء الاصطناعي', row.aiDescription],
  ];

  return (
    <>
      <PageHeader title={row.name} subtitle={`${row.code} · ${row.status}`} />
      <div className="p-6 max-w-3xl space-y-4">
        {latest ? (
          <Card className="p-6 flex items-center gap-6">
            <div className={`text-4xl font-bold ${scoreTone(latest.totalScore)}`}>{latest.totalScore}</div>
            <div>
              <DecisionBadge decision={latest.decision} />
              <p className="text-xs text-[var(--muted-foreground)] mt-1" dir="ltr">{latest.modelId}</p>
            </div>
          </Card>
        ) : (
          <Card className="p-4 text-sm text-[var(--muted-foreground)]">
            لم يُقيَّم هذا المشروع بعد. (تقييم الذكاء الاصطناعي يأتي في المرحلة 2.)
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-sm font-semibold mb-3">الوصف</h2>
          <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{row.description}</p>
        </Card>

        <Card className="p-6">
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {details.filter(([, v]) => v).map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-[var(--muted-foreground)] mb-0.5">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </>
  );
}
