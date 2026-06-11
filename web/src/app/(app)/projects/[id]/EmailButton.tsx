'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';

export function EmailButton({ projectId, defaultTo }: { projectId: string; defaultTo?: string }) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(defaultTo ?? '');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    setMsg('');
    const res = await fetch(`/api/projects/${projectId}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: to.trim() }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) setMsg('✓ تم إرسال التقرير');
    else if (data.skipped) setMsg(data.message ?? 'خدمة البريد غير مُهيّأة');
    else setMsg(data.error ?? 'تعذّر الإرسال');
  };

  if (!open) return <Button variant="outline" onClick={() => setOpen(true)}>إرسال بالبريد</Button>;

  return (
    <div className="flex flex-col items-stretch gap-1.5 w-64">
      <Input type="email" dir="ltr" className="text-left" placeholder="name@kau.edu.sa" value={to} onChange={(e) => setTo(e.target.value)} />
      <div className="flex gap-2">
        <Button onClick={send} disabled={busy || !to.includes('@')}>{busy ? 'جارٍ…' : 'إرسال'}</Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
      </div>
      {msg && <p className="text-[11px] text-[var(--muted-foreground)]">{msg}</p>}
    </div>
  );
}
