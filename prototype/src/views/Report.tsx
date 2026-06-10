import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PROJECTS, DECISION_LABEL, DECISION_STYLE, scoreTone, type Role } from '@/data';
import { ArrowRight, Mail, RefreshCw, CheckCircle2, AlertTriangle, Lightbulb, Sparkles, Printer, Info } from 'lucide-react';

function ScoreRing({ score }: { score: number }) {
  const r = 44, c = 2 * Math.PI * r;
  const color = score >= 75 ? '#006633' : score >= 60 ? '#2E9E5B' : score >= 45 ? '#C9A227' : '#DC2626';
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" role="img" aria-label={`الدرجة الكلية ${score} من 100`}>
      <circle cx="55" cy="55" r={r} fill="none" stroke="#E5E7EB" strokeWidth="9" />
      <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform="rotate(-90 55 55)" />
      <text x="55" y="52" textAnchor="middle" className="fill-current" style={{ fontSize: 26, fontWeight: 700 }}>{score}</text>
      <text x="55" y="70" textAnchor="middle" fill="#6B7280" style={{ fontSize: 10 }}>من 100</text>
    </svg>
  );
}

export default function Report({ id, role, back }: { id: string; role: Role; back?: () => void }) {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) return null;
  const canAct = role === 'admin' || role === 'evaluator';

  return (
    <div className="space-y-5 max-w-4xl">
      {back && (
        <button onClick={back} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground print:hidden">
          <ArrowRight className="w-4 h-4" /> رجوع للمشاريع
        </button>
      )}

      <Card>
        <CardContent className="pt-6 flex flex-wrap items-center gap-6">
          <ScoreRing score={p.totalScore} />
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-3 flex-wrap mb-1.5">
              <h2 className="text-xl font-bold">{p.name}</h2>
              <Badge variant="outline" className={DECISION_STYLE[p.decision]}>{DECISION_LABEL[p.decision]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{p.description}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
              <span>{p.sector}</span><span>{p.stage}</span><span>فريق من {p.teamSize}</span>
              <span>طلب تمويل: {p.fundingAsk}</span>
              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-primary" /><span dir="ltr">{p.modelId}</span></span>
            </div>
          </div>
          <div className="flex flex-col gap-2 print:hidden">
            <Button size="sm" className="gap-2 font-bold" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5" /> طباعة التقرير
            </Button>
            {canAct && (
              <>
                <Button size="sm" variant="outline" className="gap-2"><Mail className="w-3.5 h-3.5" /> إرسال التقرير</Button>
                <Button size="sm" variant="outline" className="gap-2"><RefreshCw className="w-3.5 h-3.5" /> إعادة التقييم</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {p.details && p.details.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> معلومات تفصيلية من مقدّم المشروع</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {p.details.map((d) => (
                <div key={d.label}>
                  <dt className="text-xs text-muted-foreground mb-0.5">{d.label}</dt>
                  <dd className="leading-relaxed">{d.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">درجات المعايير</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {p.criteria.map((c) => (
            <div key={c.key}>
              <div className="flex justify-between text-xs mb-1">
                <span>{c.label} <span className="text-muted-foreground">({c.weight}%)</span></span>
                <span className={`font-bold ${scoreTone(c.score)}`}>{c.score}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${c.score}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-700" /> نقاط القوة</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {p.strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-emerald-700 mt-0.5">•</span>{s}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" /> نقاط الضعف</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {p.weaknesses.map((s, i) => <li key={i} className="flex gap-2"><span className="text-amber-600 mt-0.5">•</span>{s}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-600" /> التوصيات</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {p.recommendations.map((s, i) => <li key={i} className="flex gap-2"><span className="text-amber-700 font-semibold mt-0.5">{i + 1}.</span>{s}</li>)}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">خطة العمل المقترحة</CardTitle></CardHeader>
        <CardContent>
          <div className="relative space-y-6 before:absolute before:start-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
            {p.plan.map((ph, i) => (
              <div key={i} className="relative ps-7">
                <span className="absolute start-0 top-1 w-[15px] h-[15px] rounded-full border-2 border-primary bg-background" />
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-bold text-sm">{ph.phase}</span>
                  <Badge variant="secondary" className="text-[10px]">{ph.duration}</Badge>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {ph.items.map((it, j) => <li key={j} className="flex gap-2"><span className="text-primary mt-0.5">›</span>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-[11px] text-muted-foreground pt-2">
        تقرير صادر عن حاضنة الذكاء الاصطناعي — جامعة الملك عبدالعزيز · <span dir="ltr" className="font-semibold text-primary">kau.edu.sa</span>
      </p>
    </div>
  );
}
