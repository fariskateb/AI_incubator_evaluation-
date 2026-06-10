'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Button, Input, Field } from '@/components/ui';

const KAU_GREEN = '#006633';
const KAU_DARK = '#004D26';
const KAU_GOLD = '#C9A227';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error } = await authClient.signIn.email({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setError('بيانات الدخول غير صحيحة');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <main className="flex-1 flex">
      {/* Brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] p-12 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${KAU_DARK} 0%, ${KAU_GREEN} 100%)` }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,162,39,0.2), transparent 70%)' }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 flex items-center justify-center rounded text-xl font-bold" style={{ background: KAU_GOLD, color: KAU_DARK }}>
              ع
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">جامعة الملك عبدالعزيز</div>
              <div className="text-xs text-white/70">حاضنة الذكاء الاصطناعي — منصة التقييم</div>
            </div>
          </div>
          <h1 className="text-3xl font-bold leading-snug mb-4">
            تقييم مشاريع ريادية
            <br />
            <span style={{ color: '#E8C84F' }}>بذكاء، وبأمان حقيقي.</span>
          </h1>
          <p className="text-white/75 leading-relaxed max-w-md">
            منصة جامعة الملك عبدالعزيز لتقييم مشاريع الحاضنة — مدعومة بقاعدة بيانات حقيقية ومصادقة آمنة.
          </p>
        </div>
        <p className="relative text-white/50 text-xs" dir="ltr">kau.edu.sa</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="mb-7">
            <h2 className="text-xl font-bold mb-1">تسجيل الدخول</h2>
            <p className="text-sm text-[var(--muted-foreground)]">الحسابات بالدعوة من المشرف.</p>
          </div>
          <div className="space-y-4">
            <Field label="البريد الإلكتروني" htmlFor="email">
              <Input id="email" type="email" dir="ltr" className="text-left" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@kau.edu.sa" />
            </Field>
            <Field label="كلمة المرور" htmlFor="password">
              <Input id="password" type="password" dir="ltr" className="text-left" autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? 'جارٍ الدخول...' : 'دخول'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
