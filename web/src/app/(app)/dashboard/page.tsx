import { db } from '@/db';
import { project, evaluation } from '@/db/schema';
import { isNull, sql } from 'drizzle-orm';
import { requireSession } from '@/lib/session';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui';

export default async function DashboardPage() {
  await requireSession(['admin', 'evaluator', 'investor']);

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(project)
    .where(isNull(project.deletedAt));

  const [{ evaluated }] = await db
    .select({ evaluated: sql<number>`count(distinct ${evaluation.projectId})::int` })
    .from(evaluation);

  const stats = [
    { label: 'إجمالي المشاريع', value: total },
    { label: 'مشاريع مُقيَّمة', value: evaluated },
    { label: 'بانتظار التقييم', value: Math.max(0, total - evaluated) },
  ];

  return (
    <>
      <PageHeader title="لوحة التحكم" subtitle="نظرة عامة على مشاريع الحاضنة" />
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="p-5">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">{s.label}</div>
              <div className="text-3xl font-bold">{s.value}</div>
            </Card>
          ))}
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mt-6">
          البيانات أعلاه حيّة من قاعدة بيانات Neon. أضف مشاريع من صفحة المشاريع لرؤية الأرقام تتغير.
        </p>
      </div>
    </>
  );
}
