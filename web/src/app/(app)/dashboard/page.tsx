import { requireSession } from '@/lib/session';
import { getDashboardStats } from '@/lib/stats';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui';
import { DecisionDonut, SectorBars } from '@/components/charts';

export default async function DashboardPage() {
  await requireSession(['admin', 'evaluator', 'investor']);
  const stats = await getDashboardStats();

  const cards = [
    { label: 'إجمالي المشاريع', value: stats.total, sub: 'الدفعة الحالية' },
    { label: 'مشاريع مُقيَّمة', value: stats.evaluated, sub: 'بتقييم الذكاء الاصطناعي' },
    { label: 'متوسط الدرجات', value: stats.avgScore, sub: 'من 100' },
    { label: 'بانتظار التقييم', value: stats.pending, sub: 'لم تُقيَّم بعد' },
  ];

  return (
    <>
      <PageHeader title="لوحة التحكم" subtitle="نظرة عامة على مشاريع الحاضنة" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((c) => (
            <Card key={c.label} className="p-5">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">{c.label}</div>
              <div className="text-3xl font-bold">{c.value}</div>
              <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{c.sub}</div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-6">
            <h2 className="text-sm font-semibold mb-4">توزيع قرارات الاحتضان</h2>
            <DecisionDonut decisions={stats.decisions} />
          </Card>
          <Card className="p-6">
            <h2 className="text-sm font-semibold mb-4">متوسط الدرجات حسب القطاع</h2>
            <SectorBars sectors={stats.sectors} />
          </Card>
        </div>
      </div>
    </>
  );
}
