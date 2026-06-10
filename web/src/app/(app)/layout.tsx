import { requireSession } from '@/lib/session';
import { Sidebar } from '@/components/sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSession();
  return (
    <div className="flex-1 flex">
      <Sidebar user={{ name: user.name, role: user.role }} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
