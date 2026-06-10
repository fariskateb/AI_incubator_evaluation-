import { db } from '@/db';
import { user as userTable } from '@/db/schema';
import { requireSession } from '@/lib/session';
import { PageHeader } from '@/components/page-header';
import { Card, ROLE_LABEL } from '@/components/ui';
import { CreateUser } from './CreateUser';

export default async function AdminUsersPage() {
  await requireSession(['admin']);

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

  return (
    <div className="relative">
      <PageHeader title="إدارة المستخدمين" subtitle="الحسابات بالدعوة من المشرف" action={<CreateUser />} />
      <div className="p-6">
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <th className="text-start p-3 font-semibold">المستخدم</th>
                <th className="text-start p-3 font-semibold">الدور</th>
                <th className="text-start p-3 font-semibold">الحالة</th>
                <th className="text-start p-3 font-semibold">أُنشئ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="p-3">
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-[11px] text-[var(--muted-foreground)]" dir="ltr">{u.email}</div>
                  </td>
                  <td className="p-3">{ROLE_LABEL[u.role]}</td>
                  <td className="p-3">
                    {u.banned ? <span className="text-red-600">محظور</span> : <span className="text-[#006633]">نشط</span>}
                  </td>
                  <td className="p-3 text-[var(--muted-foreground)] text-xs" dir="ltr">{u.createdAt.toISOString().slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
