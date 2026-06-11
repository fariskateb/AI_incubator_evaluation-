import { scoreTone } from '@/components/ui';
import type { Decision } from '@/lib/stats';

const DECISION_LABEL: Record<Decision, string> = {
  direct: 'احتضان مباشر', conditional: 'احتضان مشروط', develop: 'يحتاج تطوير', unsuitable: 'غير مناسب',
};
const DECISION_COLOR: Record<Decision, string> = {
  direct: '#006633', conditional: '#2E9E5B', develop: '#C9A227', unsuitable: '#DC2626',
};

export function DecisionDonut({ decisions }: { decisions: Record<Decision, number> }) {
  const entries = (Object.keys(decisions) as Decision[]).map((d) => ({ d, n: decisions[d] }));
  const total = entries.reduce((s, e) => s + e.n, 0);

  if (total === 0) {
    return <p className="text-sm text-[var(--muted-foreground)] py-8 text-center">لا توجد تقييمات بعد.</p>;
  }

  const r = 56, cx = 70, cy = 70;
  let acc = 0;
  const arc = (start: number, end: number) => {
    const a1 = ((start - 90) * Math.PI) / 180;
    const a2 = ((end - 90) * Math.PI) / 180;
    const large = end - start > 180 ? 1 : 0;
    return `M ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a2)} ${cy + r * Math.sin(a2)}`;
  };

  return (
    <div className="flex items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-scale-x-100" role="img"
        aria-label={entries.map((e) => `${DECISION_LABEL[e.d]}: ${e.n}`).join('، ')}>
        {entries.filter((e) => e.n > 0).map((e) => {
          const start = (acc / total) * 360;
          acc += e.n;
          const end = (acc / total) * 360;
          return <path key={e.d} d={arc(start + 1.5, end - 1.5)} fill="none" stroke={DECISION_COLOR[e.d]} strokeWidth="16" />;
        })}
        <text x="70" y="66" textAnchor="middle" className="fill-[var(--foreground)]" style={{ fontSize: 22, fontWeight: 700, transform: 'scaleX(-1)', transformOrigin: 'center' }}>{total}</text>
        <text x="70" y="84" textAnchor="middle" fill="#6B7280" style={{ fontSize: 10, transform: 'scaleX(-1)', transformOrigin: 'center' }}>مُقيَّم</text>
      </svg>
      <div className="space-y-2">
        {entries.map((e) => (
          <div key={e.d} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-[2px]" style={{ background: DECISION_COLOR[e.d] }} />
            <span className="text-[var(--muted-foreground)]">{DECISION_LABEL[e.d]}</span>
            <span className="font-bold">{e.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SectorBars({ sectors }: { sectors: { sector: string; avg: number; count: number }[] }) {
  if (sectors.length === 0) {
    return <p className="text-sm text-[var(--muted-foreground)] py-8 text-center">لا توجد بيانات قطاعية بعد.</p>;
  }
  return (
    <div className="space-y-3">
      {sectors.map((s) => (
        <div key={s.sector}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--muted-foreground)]">{s.sector} <span className="opacity-60">({s.count})</span></span>
            <span className={`font-bold ${scoreTone(s.avg)}`}>{s.avg}</span>
          </div>
          <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${s.avg}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
