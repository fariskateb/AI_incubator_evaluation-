import Link from 'next/link';
import { db } from '@/db';
import { project } from '@/db/schema';
import { desc, isNull } from 'drizzle-orm';
import { requireSession } from '@/lib/session';
import { PageHeader } from '@/components/page-header';
import { Card, Button } from '@/components/ui';

export default async function ProjectsPage() {
  const user = await requireSession(['admin', 'evaluator', 'investor']);
  const canCreate = user.role === 'admin' || user.role === 'evaluator';

  const rows = await db.select().from(project).where(isNull(project.deletedAt)).orderBy(desc(project.createdAt));

  return (
    <>
      <PageHeader
        title="المشاريع"
        subtitle="جميع المشاريع في الحاضنة"
        action={canCreate ? <Link href="/projects/new"><Button>مشروع جديد</Button></Link> : undefined}
      />
      <div className="p-6">
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <th className="text-start p-3 font-semibold">المشروع</th>
                <th className="text-start p-3 font-semibold">القطاع</th>
                <th className="text-start p-3 font-semibold">المرحلة</th>
                <th className="text-start p-3 font-semibold">الحالة</th>
                <th className="text-start p-3 font-semibold">أُنشئ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]">
                  <td className="p-3">
                    <Link href={`/projects/${p.id}`} className="font-semibold hover:text-[var(--primary)]">{p.name}</Link>
                    <div className="text-[11px] text-[var(--muted-foreground)]" dir="ltr">{p.code}</div>
                  </td>
                  <td className="p-3 text-[var(--muted-foreground)]">{p.sector}</td>
                  <td className="p-3 text-[var(--muted-foreground)]">{p.stage ?? '—'}</td>
                  <td className="p-3 text-[var(--muted-foreground)]">{p.status}</td>
                  <td className="p-3 text-[var(--muted-foreground)] text-xs" dir="ltr">{p.createdAt.toISOString().slice(0, 10)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="text-center text-[var(--muted-foreground)] py-12">لا توجد مشاريع بعد.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
