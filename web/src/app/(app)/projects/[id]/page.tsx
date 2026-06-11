import { notFound } from 'next/navigation';
import { db } from '@/db';
import { project, evaluation, actionPlan } from '@/db/schema';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { requireSession } from '@/lib/session';
import { PageHeader } from '@/components/page-header';
import { Card, DecisionBadge, scoreTone } from '@/components/ui';
import { EvaluateButton } from './EvaluateButton';
import { EmailButton } from './EmailButton';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession();

  const [row] = await db.select().from(project).where(and(eq(project.id, id), isNull(project.deletedAt)));
  if (!row) notFound();
  if (user.role === 'student' && row.ownerId !== user.id) notFound();

  const [latest] = await db
    .select().from(evaluation).where(eq(evaluation.projectId, id))
    .orderBy(desc(evaluation.createdAt)).limit(1);
  const [plan] = await db
    .select().from(actionPlan).where(eq(actionPlan.projectId, id))
    .orderBy(desc(actionPlan.createdAt)).limit(1);

  const canEvaluate =
    user.role === 'admin' || user.role === 'evaluator' || (user.role === 'student' && row.ownerId === user.id);
  const canEmail = (user.role === 'admin' || user.role === 'evaluator') && !!latest;

  const details: [string, string | null | undefined][] = [
    ['القطاع', row.sector], ['المرحلة', row.stage],
    ['حجم الفريق', row.teamSize ? String(row.teamSize) : null], ['طلب التمويل', row.fundingAsk],
    ['الفئة المستهدفة', row.targetAudience], ['حجم السوق', row.marketSize],
    ['نموذج الإيرادات', row.revenueModel], ['المنافسون', row.competitors],
    ['استخدام الذكاء الاصطناعي', row.aiDescription],
  ];

  return (
    <>
      <PageHeader
        title={row.name}
        subtitle={`${row.code} · ${row.status}`}
        action={
          <div className="flex items-start gap-2">
            {canEmail && <EmailButton projectId={id} />}
            {canEvaluate && <EvaluateButton projectId={id} label={latest ? 'إعادة التقييم' : 'تقييم بالذكاء الاصطناعي'} />}
          </div>
        }
      />
      <div className="p-6 max-w-3xl space-y-4">
        {latest ? (
          <Card className="p-6 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${scoreTone(latest.totalScore)}`}>{latest.totalScore}</div>
              <div>
                <DecisionBadge decision={latest.decision} />
                <p className="text-[11px] text-[var(--muted-foreground)] mt-1" dir="ltr">
                  {latest.modelId}{latest.kind === 'heuristic' ? ' (تقييم محلي)' : ''}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-4 text-sm text-[var(--muted-foreground)]">
            لم يُقيَّم هذا المشروع بعد. {canEvaluate ? 'اضغط زر التقييم أعلاه لتشغيل تقييم Claude.' : ''}
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-sm font-semibold mb-3">الوصف</h2>
          <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{row.description}</p>
        </Card>

        {latest && (
          <Card className="p-6">
            <h2 className="text-sm font-semibold mb-4">درجات المعايير</h2>
            <div className="space-y-3">
              {latest.criteria.map((c) => (
                <div key={c.key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{c.label} <span className="text-[var(--muted-foreground)]">({c.weight}%)</span></span>
                    <span className={`font-bold ${scoreTone(c.score)}`}>{c.score}</span>
                  </div>
                  <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${c.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {latest && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-3 text-emerald-700">نقاط القوة</h3>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                {latest.strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-emerald-700">•</span>{s}</li>)}
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-3 text-amber-600">نقاط الضعف</h3>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                {latest.weaknesses.map((s, i) => <li key={i} className="flex gap-2"><span className="text-amber-600">•</span>{s}</li>)}
              </ul>
            </Card>
          </div>
        )}

        {latest && latest.recommendations.length > 0 && (
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-3">التوصيات</h3>
            <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
              {latest.recommendations.map((s, i) => <li key={i} className="flex gap-2"><span className="text-[var(--primary)] font-semibold">{i + 1}.</span>{s}</li>)}
            </ul>
          </Card>
        )}

        {plan && plan.phases.length > 0 && (
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-4">خطة العمل المقترحة</h3>
            <div className="space-y-5">
              {plan.phases.map((ph, i) => (
                <div key={i} className="border-s-2 border-[var(--primary)] ps-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-sm">{ph.phase}</span>
                    <span className="text-[10px] bg-[var(--muted)] rounded-full px-2 py-0.5">{ph.duration}</span>
                  </div>
                  <ul className="space-y-1 text-sm text-[var(--muted-foreground)]">
                    {ph.items.map((it, j) => <li key={j} className="flex gap-2"><span className="text-[var(--primary)]">›</span>{it}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-sm font-semibold mb-3">تفاصيل المشروع</h2>
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
