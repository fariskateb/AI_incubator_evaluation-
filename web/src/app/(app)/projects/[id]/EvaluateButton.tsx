'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export function EvaluateButton({ projectId, label }: { projectId: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/projects/${projectId}/evaluations`, { method: 'POST' });
    setBusy(false);
    if (!res.ok) {
      setError('تعذّر التقييم — حاول مرة أخرى');
      return;
    }
    router.refresh();
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button onClick={run} disabled={busy}>
        {busy ? 'جارٍ التقييم بالذكاء الاصطناعي…' : label}
      </Button>
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
