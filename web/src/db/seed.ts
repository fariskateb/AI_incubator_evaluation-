import 'dotenv/config';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Seeds the first admin account. Idempotent — promotes the user to admin if
// they already exist. Run with `pnpm db:seed`.
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? 'Admin';

  if (!email || !password) {
    throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.local');
  }

  const existing = await db.query.user.findFirst({ where: eq(user.email, email) });

  if (existing) {
    await db.update(user).set({ role: 'admin' }).where(eq(user.id, existing.id));
    console.log(`✓ Existing user ${email} promoted to admin.`);
    return;
  }

  // Create via better-auth so the password is hashed correctly.
  await auth.api.signUpEmail({ body: { email, password, name } });
  await db.update(user).set({ role: 'admin', emailVerified: true }).where(eq(user.email, email));
  console.log(`✓ Admin account created: ${email}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
