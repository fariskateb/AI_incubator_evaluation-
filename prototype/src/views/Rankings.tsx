import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PROJECTS, DECISION_LABEL, DECISION_STYLE, scoreTone } from '@/data';
import { Trophy } from 'lucide-react';

type RankKey = 'total' | 'innovation' | 'tech' | 'market' | 'team' | 'finance';

const TABS: { key: RankKey; label: string }[] = [
  { key: 'total', label: 'الدرجة الكلية' },
  { key: 'innovation', label: 'الابتكار' },
  { key: 'tech', label: 'الجدوى التقنية' },
  { key: 'market', label: 'السوق' },
  { key: 'team', label: 'الفريق' },
  { key: 'finance', label: 'النموذج المالي' },
];

const CRIT_INDEX: Record<Exclude<RankKey, 'total'>, number> = { innovation: 0, tech: 1, market: 2, team: 3, finance: 4 };

const RANK_MEDAL = ['bg-accent text-accent-foreground', 'bg-slate-300 text-slate-800', 'bg-amber-700/80 text-white'];

export default function Rankings({ openReport }: { openReport: (id: string) => void }) {
  const [tab, setTab] = useState<RankKey>('total');

  const ranked = useMemo(() => {
    const scoreOf = (p: (typeof PROJECTS)[number]) =>
      tab === 'total' ? p.totalScore : p.criteria[CRIT_INDEX[tab]].score;
    return [...PROJECTS].map((p) => ({ p, score: scoreOf(p) })).sort((a, b) => b.score - a.score);
  }, [tab]);

  const max = ranked[0]?.score || 100;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 p-1 bg-secondary rounded-md w-fit">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3.5 py-1.5 text-sm font-semibold rounded transition-colors ${
              tab === t.key ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-2 space-y-0.5">
          {ranked.map(({ p, score }, i) => (
            <button key={p.id} onClick={() => openReport(p.id)}
              className="w-full flex items-center gap-4 p-3 rounded-sm hover:bg-secondary transition-colors text-start">
              <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded-full shrink-0 ${RANK_MEDAL[i] ?? 'bg-muted text-muted-foreground'}`}>
                {i < 3 ? <Trophy className="w-4 h-4" /> : i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate">{p.name}</span>
                  <Badge variant="outline" className={`${DECISION_STYLE[p.decision]} hidden sm:inline-flex`}>{DECISION_LABEL[p.decision]}</Badge>
                </div>
                <div className="text-[11px] text-muted-foreground mb-1.5">{p.sector} · {p.code}</div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(score / max) * 100}%` }} />
                </div>
              </div>
              <span className={`text-xl font-bold w-10 text-center shrink-0 ${scoreTone(score)}`}>{score}</span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
