import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { project } from '@/db/schema';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { requireSession } from '@/lib/session';
import { PageHeader } from '@/components/page-header';
import { Card, Button } from '@/components/ui';

export default async function MyProjectPage() {
  const user = await requireSession(['student']);

  const [mine] = await db
    .select()
    .from(project)
    .where(and(eq(project.ownerId, user.id), isNull(project.deletedAt)))
    .orderBy(desc(project.createdAt))
    .limit(1);

  if (mine) redirect(`/projects/${mine.id}`);

  return (
    <>
      <PageHeader title="مشروعي" subtitle="لم تقدّم مشروعاً بعد" />
      <div className="p-6">
        <Card className="p-8 text-center max-w-lg">
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            أدخل بيانات مشروعك للحصول على تقييم مبدئي من حاضنة الذكاء الاصطناعي.
          </p>
          <Link href="/projects/new"><Button>إضافة مشروعي</Button></Link>
        </Card>
      </div>
    </>
  );
}
