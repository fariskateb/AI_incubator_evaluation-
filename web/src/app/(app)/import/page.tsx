'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, Button } from '@/components/ui';

interface Extracted {
  name: string;
  sector: string;
  description: string;
  stage?: string;
  teamSize?: number;
  fundingAsk?: string;
  include: boolean;
}

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ['رفع الملف', 'الاستخراج الذكي', 'المراجعة', 'تم'];

export default function ImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<Extracted[]>([]);
  const [imported, setImported] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setFileName(file.name);
    setError('');
    setStep(2);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/imports/extract', { method: 'POST', body: fd });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'تعذّر استخراج البيانات من الملف');
      setStep(1);
      return;
    }
    const { projects } = await res.json();
    setRows((projects as Extracted[]).map((p) => ({ ...p, include: true })));
    setStep(3);
  };

  const toggle = (i: number) => setRows(rows.map((r, idx) => (idx === i ? { ...r, include: !r.include } : r)));

  const confirm = async () => {
    setError('');
    const chosen = rows.filter((r) => r.include).map(({ include, ...p }) => p); // eslint-disable-line @typescript-eslint/no-unused-vars
    const res = await fetch('/api/imports/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projects: chosen }),
    });
    if (!res.ok) {
      setError('تعذّر استيراد المشاريع');
      return;
    }
    const { created } = await res.json();
    setImported(created);
    setStep(4);
  };

  const includedCount = rows.filter((r) => r.include).length;

  return (
    <>
      <PageHeader title="استيراد من Excel" subtitle="ارفع ملفاً ليقرأه Claude ويستخرج المشاريع تلقائياً" />
      <div className="p-6 max-w-3xl space-y-5">
        {/* Stepper */}
        <div className="flex items-center gap-2">
          {STEP_LABELS.map((label, i) => {
            const n = (i + 1) as Step;
            const done = step > n, active = step === n;
            return (
              <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`flex items-center gap-2 ${active || done ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${done ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : active ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`}>
                    {done ? '✓' : n}
                  </span>
                  <span className="text-xs font-semibold hidden sm:block">{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && <div className={`flex-1 h-px ${done ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />}
              </div>
            );
          })}
        </div>

        {error && <p role="alert" className="text-xs text-red-600">{error}</p>}

        {step === 1 && (
          <Card className="p-6">
            <button onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-[var(--border)] rounded-lg p-12 flex flex-col items-center gap-3 hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-colors text-center">
              <div className="text-4xl">📄</div>
              <div className="font-semibold">اضغط لاختيار ملف Excel</div>
              <p className="text-xs text-[var(--muted-foreground)] max-w-sm">
                يقرأ نموذج Claude الأعمدة تلقائياً ويستخرج بيانات كل مشروع. الصيغ المدعومة: .xlsx، .csv
              </p>
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
          </Card>
        )}

        {step === 2 && (
          <Card className="p-10 text-center space-y-3">
            <div className="text-sm font-semibold">يقرأ Claude الملف ويستخرج المشاريع…</div>
            <p className="text-xs text-[var(--muted-foreground)]" dir="ltr">{fileName}</p>
            <div className="h-1.5 max-w-sm mx-auto bg-[var(--muted)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--primary)] rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </Card>
        )}

        {step === 3 && (
          <>
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] text-sm font-semibold">
                المشاريع المستخرجة ({includedCount} من {rows.length} محددة)
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                    <th className="p-3 w-10"></th>
                    <th className="text-start p-3 font-semibold">المشروع</th>
                    <th className="text-start p-3 font-semibold">القطاع</th>
                    <th className="text-start p-3 font-semibold">المرحلة</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className={`border-b border-[var(--border)] last:border-0 ${!r.include ? 'opacity-45' : ''}`}>
                      <td className="p-3 text-center">
                        <input type="checkbox" checked={r.include} onChange={() => toggle(i)} aria-label={`تضمين ${r.name}`}
                          className="w-4 h-4" style={{ accentColor: '#006633' }} />
                      </td>
                      <td className="p-3">
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-[11px] text-[var(--muted-foreground)] line-clamp-1">{r.description}</div>
                      </td>
                      <td className="p-3 text-[var(--muted-foreground)]">{r.sector}</td>
                      <td className="p-3 text-[var(--muted-foreground)]">{r.stage ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <div className="flex gap-2">
              <Button onClick={confirm} disabled={includedCount === 0}>استيراد {includedCount} مشروعاً</Button>
              <Button variant="ghost" onClick={() => { setStep(1); setRows([]); }}>إلغاء</Button>
            </div>
          </>
        )}

        {step === 4 && (
          <Card className="p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto text-2xl">✓</div>
            <div className="font-bold text-lg">تم استيراد {imported} مشروعاً بنجاح</div>
            <p className="text-sm text-[var(--muted-foreground)]">أُضيفت المشاريع إلى القائمة. يمكنك تقييم كل مشروع من صفحته.</p>
            <Button onClick={() => { router.push('/projects'); router.refresh(); }}>عرض المشاريع</Button>
          </Card>
        )}
      </div>
    </>
  );
}
