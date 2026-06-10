import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PROJECTS, DECISION_LABEL, DECISION_STYLE, SECTORS, scoreTone, type Decision } from '@/data';
import { TrendingUp, FolderOpen, Award, Clock } from 'lucide-react';

const DECISION_COLORS: Record<Decision, string> = {
  direct: '#006633',
  conditional: '#2E9E5B',
  develop: '#C9A227',
  unsuitable: '#DC2626',
};

function Donut() {
  const counts = (['direct', 'conditional', 'develop', 'unsuitable'] as Decision[]).map((d) => ({
    d,
    n: PROJECTS.filter((p) => p.decision === d).length,
  }));
  const total = PROJECTS.length;
  let acc = 0;
  const segs = counts.map(({ d, n }) => {
    const start = (acc / total) * 360;
    acc += n;
    const end = (acc / total) * 360;
    return { d, n, start, end };
  });
  const arc = (start: number, end: number) => {
    const r = 56, cx = 70, cy = 70;
    const a1 = ((start - 90) * Math.PI) / 180;
    const a2 = ((end - 90) * Math.PI) / 180;
    const large = end - start > 180 ? 1 : 0;
    return `M ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a2)} ${cy + r * Math.sin(a2)}`;
  };
  return (
    <div className="flex items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-scale-x-100" role="img"
        aria-label={segs.map((s) => `${DECISION_LABEL[s.d]}: ${s.n}`).join('، ')}>
        {segs.map((s) => (
          <path key={s.d} d={arc(s.start + 2, s.end - 2)} fill="none" stroke={DECISION_COLORS[s.d]} strokeWidth="16" strokeLinecap="butt" />
        ))}
        <text x="70" y="66" textAnchor="middle" className="fill-current" style={{ fontSize: 22, fontWeight: 700, transform: 'scaleX(-1)', transformOrigin: 'center' }}>
          {total}
        </text>
        <text x="70" y="84" textAnchor="middle" fill="#6B7280" style={{ fontSize: 10, transform: 'scaleX(-1)', transformOrigin: 'center' }}>
          مشروعاً
        </text>
      </svg>
      <div className="space-y-2">
        {segs.map((s) => (
          <div key={s.d} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-[2px]" style={{ background: DECISION_COLORS[s.d] }} />
            <span className="text-muted-foreground">{DECISION_LABEL[s.d]}</span>
            <span className="font-bold">{s.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectorBars() {
  const data = SECTORS.map((s) => ({
    s,
    avg: Math.round(PROJECTS.filter((p) => p.sector === s).reduce((a, p) => a + p.totalScore, 0) / PROJECTS.filter((p) => p.sector === s).length),
  })).sort((a, b) => b.avg - a.avg);
  return (
    <div className="space-y-3">
      {data.map(({ s, avg }) => (
        <div key={s}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">{s}</span>
            <span className={`font-bold ${scoreTone(avg)}`}>{avg}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${avg}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ openReport }: { openReport: (id: string) => void }) {
  const avg = Math.round(PROJECTS.reduce((a, p) => a + p.totalScore, 0) / PROJECTS.length);
  const direct = PROJECTS.filter((p) => p.decision === 'direct').length;
  const top = [...PROJECTS].sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);

  const stats = [
    { icon: FolderOpen, label: 'إجمالي المشاريع', value: PROJECTS.length, sub: 'الدفعة الحالية' },
    { icon: TrendingUp, label: 'متوسط الدرجات', value: avg, sub: 'من 100' },
    { icon: Award, label: 'احتضان مباشر', value: direct, sub: 'مشاريع مؤهلة' },
    { icon: Clock, label: 'بانتظار التقييم', value: 0, sub: 'كل المشاريع مُقيَّمة' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</div>
              </div>
              <div className="w-9 h-9 bg-primary/10 text-primary flex items-center justify-center rounded-sm">
                <s.icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">توزيع قرارات الاحتضان</CardTitle></CardHeader>
          <CardContent><Donut /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">متوسط الدرجات حسب القطاع</CardTitle></CardHeader>
          <CardContent><SectorBars /></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">أعلى المشاريع تقييماً</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {top.map((p, i) => (
            <button key={p.id} onClick={() => openReport(p.id)}
              className="w-full flex items-center gap-4 p-3 rounded-sm hover:bg-secondary transition-colors text-start">
              <span className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-sm ${i === 0 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{p.name}</div>
                <div className="text-[11px] text-muted-foreground">{p.sector} · {p.code}</div>
              </div>
              <Badge variant="outline" className={DECISION_STYLE[p.decision]}>{DECISION_LABEL[p.decision]}</Badge>
              <span className={`text-lg font-bold w-10 text-center ${scoreTone(p.totalScore)}`}>{p.totalScore}</span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
