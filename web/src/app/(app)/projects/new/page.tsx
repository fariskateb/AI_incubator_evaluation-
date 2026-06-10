'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, Button, Input, Textarea, Field } from '@/components/ui';

const SECTORS = ['التقنية المالية', 'الصحة', 'التعليم', 'الاتصالات', 'الزراعة', 'الخدمات القانونية', 'التجارة', 'السياحة', 'الطاقة', 'أخرى'];
const STAGES = ['فكرة', 'فكرة متقدمة', 'نموذج تجريبي', 'منتج أولي (MVP)', 'إطلاق مبكر'];

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', sector: '', stage: '', teamSize: '', fundingAsk: '', description: '', targetAudience: '', marketSize: '', competitors: '', aiDescription: '', revenueModel: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      sector: form.sector,
      description: form.description.trim(),
    };
    for (const k of ['stage', 'fundingAsk', 'targetAudience', 'marketSize', 'competitors', 'aiDescription', 'revenueModel'] as const) {
      if (form[k].trim()) payload[k] = form[k].trim();
    }
    if (form.teamSize) payload.teamSize = Number(form.teamSize);

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.issues?.[0]?.message ?? 'تعذّر حفظ المشروع — تحقق من الحقول المطلوبة');
      return;
    }
    const { project } = await res.json();
    router.push(`/projects/${project.id}`);
    router.refresh();
  };

  return (
    <>
      <PageHeader title="إضافة مشروع جديد" subtitle="أدخل بيانات المشروع" />
      <form onSubmit={submit} className="p-6 max-w-2xl space-y-4">
        <Card className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="اسم المشروع *" htmlFor="name">
              <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="مثال: منصة تحليل ذكي" />
            </Field>
            <Field label="القطاع *" htmlFor="sector">
              <select id="sector" value={form.sector} onChange={(e) => set('sector', e.target.value)}
                className="h-9 w-full rounded-md border border-[var(--border)] bg-card px-3 text-sm">
                <option value="">اختر القطاع</option>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="مرحلة المشروع" htmlFor="stage">
              <select id="stage" value={form.stage} onChange={(e) => set('stage', e.target.value)}
                className="h-9 w-full rounded-md border border-[var(--border)] bg-card px-3 text-sm">
                <option value="">اختر المرحلة</option>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="حجم الفريق" htmlFor="teamSize">
              <Input id="teamSize" type="number" min={1} max={100} value={form.teamSize} onChange={(e) => set('teamSize', e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="طلب التمويل (اختياري)" htmlFor="fundingAsk">
                <Input id="fundingAsk" value={form.fundingAsk} onChange={(e) => set('fundingAsk', e.target.value)} placeholder="مثال: 500 ألف ريال" />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="وصف المشروع والمشكلة *" htmlFor="description" hint={`${form.description.trim().length} / 20 حرفاً كحد أدنى`}>
                <Textarea id="description" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="اشرح الفكرة والمشكلة والفئة المستهدفة..." />
              </Field>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="text-sm font-semibold">معلومات تفصيلية (اختياري)</div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="الفئة المستهدفة" htmlFor="targetAudience"><Input id="targetAudience" value={form.targetAudience} onChange={(e) => set('targetAudience', e.target.value)} /></Field>
            <Field label="حجم السوق" htmlFor="marketSize"><Input id="marketSize" value={form.marketSize} onChange={(e) => set('marketSize', e.target.value)} /></Field>
            <Field label="نموذج الإيرادات" htmlFor="revenueModel"><Input id="revenueModel" value={form.revenueModel} onChange={(e) => set('revenueModel', e.target.value)} /></Field>
            <Field label="المنافسون" htmlFor="competitors"><Input id="competitors" value={form.competitors} onChange={(e) => set('competitors', e.target.value)} /></Field>
            <div className="sm:col-span-2">
              <Field label="كيف يُستخدم الذكاء الاصطناعي؟" htmlFor="aiDescription"><Textarea id="aiDescription" rows={2} value={form.aiDescription} onChange={(e) => set('aiDescription', e.target.value)} /></Field>
            </div>
          </div>
        </Card>

        {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? 'جارٍ الحفظ...' : 'حفظ المشروع'}</Button>
      </form>
    </>
  );
}
