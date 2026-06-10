import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export type Role = 'admin' | 'evaluator' | 'investor' | 'student';

export class AuthError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message);
  }
}

/** Resolve the current session user, or throw 401. Use in every protected handler. */
export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new AuthError(401, 'Not authenticated');
  const user = session.user as typeof session.user & { role: Role; banned: boolean };
  if (user.banned) throw new AuthError(403, 'Account is banned');
  return user;
}

/** Require the user to hold one of the given roles, or throw 403. Deny by default. */
export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new AuthError(403, 'Insufficient permissions');
  return user;
}

/** Map an AuthError (or anything) to a Response for API route handlers. */
export function toErrorResponse(err: unknown): Response {
  if (err instanceof AuthError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return Response.json({ error: 'Internal error' }, { status: 500 });
}
