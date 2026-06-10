'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { ROLE_LABEL } from '@/components/ui';
import type { Role } from '@/lib/rbac';

const KAU_DARK = '#004D26';
const KAU_GOLD = '#C9A227';

const NAV: { href: string; label: string; roles: Role[] }[] = [
  { href: '/dashboard', label: 'لوحة التحكم', roles: ['admin', 'evaluator', 'investor'] },
  { href: '/projects', label: 'المشاريع', roles: ['admin', 'evaluator', 'investor'] },
  { href: '/my-project', label: 'مشروعي', roles: ['student'] },
  { href: '/admin/users', label: 'إدارة المستخدمين', roles: ['admin'] },
];

export function Sidebar({ user }: { user: { name: string; role: Role } }) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = NAV.filter((n) => n.roles.includes(user.role));

  const logout = async () => {
    await authClient.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-56 shrink-0 border-l border-[var(--border)] bg-card flex flex-col sticky top-0 h-screen">
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-[var(--border)]">
        <div className="w-7 h-7 flex items-center justify-center rounded text-sm font-bold" style={{ background: KAU_GOLD, color: KAU_DARK }}>
          ع
        </div>
        <div className="leading-tight">
          <div className="font-bold text-[13px]">جامعة الملك عبدالعزيز</div>
          <div className="text-[10px] text-[var(--muted-foreground)]">حاضنة الذكاء الاصطناعي</div>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {nav.map((n) => {
          const active = pathname === n.href || pathname.startsWith(n.href + '/');
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-semibold'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-bold shrink-0">
            {user.name[0]}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate">{user.name}</div>
            <div className="text-[10px] text-[var(--muted-foreground)]">{ROLE_LABEL[user.role]}</div>
          </div>
        </div>
        <button onClick={logout} className="w-full text-start px-2 py-1.5 rounded text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
