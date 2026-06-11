import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PROJECTS, DECISION_LABEL, DECISION_STYLE, scoreTone, type Project } from '@/data';
import { TrendingUp, X } from 'lucide-react';

const INVEST_RECO = (p: Project) =>
  p.totalScore >= 80
    ? { text: 'أولوية استثمارية عالية', cls: 'bg-emerald-50 text-emerald-700 border-emerald-300' }
    : p.totalScore >= 65
    ? { text: 'فرصة واعدة بشروط', cls: 'bg-amber-50 text-amber-700 border-amber-300' }
    : { text: 'مراقبة وإعادة تقييم', cls: 'bg-slate-100 text-slate-700 border-slate-300' };

export default function Compare({ openReport }: { openReport: (id: string) => void }) {
  const [ids, setIds] = useState<string[]>([PROJECTS[0].id, PROJECTS[1].id]);
  const selected = ids.map((id) => PROJECTS.find((p) => p.id === id)!).filter(Boolean);
  const criteria = PROJECTS[0].criteria.map((c) => c.label);

  const addSlot = (id: string) => { if (id && !ids.includes(id)) setIds([...ids, id]); };
  const removeSlot = (id: string) => setIds(ids.filter((x) => x !== id));

  const best = (label: string) => {
    const idx = criteria.indexOf(label);
    let top = -1, topId = '';
    selected.forEach((p) => { if (p.criteria[idx].score > top) { top = p.criteria[idx].score; topId = p.id; } });
    return topId;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">أضف مشروعاً للمقارنة:</span>
        <Select value="" onValueChange={addSlot}>
          <SelectTrigger className="w-56"><SelectValue placeholder="اختر مشروعاً" /></SelectTrigger>
          <SelectContent>
            {PROJECTS.filter((p) => !ids.includes(p.id)).map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected.length < 2 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">اختر مشروعين على الأقل للمقارنة.</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-start p-4 font-semibold text-muted-foreground w-40">المعيار</th>
                  {selected.map((p) => (
                    <th key={p.id} className="p-4 text-start min-w-[180px]">
                      <div className="flex items-start justify-between gap-2">
                        <button onClick={() => openReport(p.id)} className="text-start hover:text-primary">
                          <div className="font-bold">{p.name}</div>
                          <div className="text-[11px] text-muted-foreground font-normal" dir="ltr">{p.code}</div>
                        </button>
                        {selected.length > 2 && (
                          <button onClick={() => removeSlot(p.id)} className="text-muted-foreground hover:text-destructive shrink-0" aria-label="إزالة">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border bg-secondary/40">
                  <td className="p-4 font-semibold">الدرجة الكلية</td>
                  {selected.map((p) => (
                    <td key={p.id} className={`p-4 text-2xl font-bold ${scoreTone(p.totalScore)}`}>{p.totalScore}</td>
                  ))}
                </tr>
                {criteria.map((label, idx) => {
                  const winner = best(label);
                  return (
                    <tr key={label} className="border-b border-border">
                      <td className="p-4 text-muted-foreground">{label}</td>
                      {selected.map((p) => (
                        <td key={p.id} className="p-4">
                          <span className={`font-bold ${p.id === winner ? 'text-primary' : ''}`}>{p.criteria[idx].score}</span>
                          {p.id === winner && <span className="text-[10px] text-primary ms-1">الأعلى</span>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr className="border-b border-border">
                  <td className="p-4 text-muted-foreground">القرار</td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-4"><Badge variant="outline" className={DECISION_STYLE[p.decision]}>{DECISION_LABEL[p.decision]}</Badge></td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-muted-foreground">طلب التمويل</td>
                  {selected.map((p) => <td key={p.id} className="p-4">{p.fundingAsk}</td>)}
                </tr>
                <tr>
                  <td className="p-4 text-muted-foreground align-top">توصية الاستثمار</td>
                  {selected.map((p) => {
                    const r = INVEST_RECO(p);
                    return <td key={p.id} className="p-4"><Badge variant="outline" className={r.cls}>{r.text}</Badge></td>;
                  })}
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> خلاصة المقارنة</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed">
          {selected.length >= 2 && (() => {
            const top = [...selected].sort((a, b) => b.totalScore - a.totalScore)[0];
            return `يتصدّر مشروع «${top.name}» المقارنة بدرجة ${top.totalScore}، مع ${DECISION_LABEL[top.decision]}. تُبرز المقارنة تفوّقه في المعايير المرتفعة وتساعد لجنة الاستثمار على المفاضلة بين الفرص.`;
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
