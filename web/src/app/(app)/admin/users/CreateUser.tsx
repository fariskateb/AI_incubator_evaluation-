'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Field } from '@/components/ui';

const ROLES = [
  { value: 'student', label: 'طالب' },
  { value: 'evaluator', label: 'مقيّم' },
  { value: 'investor', label: 'مستثمر' },
  { value: 'admin', label: 'مشرف' },
];

export function CreateUser() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, name: form.name.trim(), email: form.email.trim() }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? data.issues?.[0]?.message ?? 'تعذّر إنشاء المستخدم');
      return;
    }
    setForm({ name: '', email: '', password: '', role: 'student' });
    setOpen(false);
    router.refresh();
  };

  if (!open) return <Button onClick={() => setOpen(true)}>إضافة مستخدم</Button>;

  return (
    <Card className="p-5 absolute end-6 top-20 z-10 w-80 shadow-lg">
      <form onSubmit={submit} className="space-y-3">
        <div className="font-semibold text-sm">إضافة مستخدم جديد</div>
        <Field label="الاسم" htmlFor="cu-name"><Input id="cu-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="البريد" htmlFor="cu-email"><Input id="cu-email" type="email" dir="ltr" className="text-left" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="كلمة المرور المؤقتة" htmlFor="cu-pass" hint="8 أحرف على الأقل"><Input id="cu-pass" type="text" dir="ltr" className="text-left" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <Field label="الدور" htmlFor="cu-role">
          <select id="cu-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="h-9 w-full rounded-md border border-[var(--border)] bg-card px-3 text-sm">
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </Field>
        {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={busy}>{busy ? 'جارٍ...' : 'إنشاء'}</Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
        </div>
      </form>
    </Card>
  );
}
