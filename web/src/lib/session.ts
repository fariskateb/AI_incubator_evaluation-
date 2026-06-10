import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import type { Role } from '@/lib/rbac';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  banned: boolean;
};

/** Returns the current user or null. For use in server components. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  return session.user as unknown as SessionUser;
}

/** Returns the current user, or redirects to /login. Optionally restricts to roles. */
export async function requireSession(roles?: Role[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || user.banned) redirect('/login');
  // Send role-mismatches to '/', which dispatches to the right home per role
  // (avoids a redirect loop if the target page itself is role-restricted).
  if (roles && !roles.includes(user.role)) redirect('/');
  return user;
}
