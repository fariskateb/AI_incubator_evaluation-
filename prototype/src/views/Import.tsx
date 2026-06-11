import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PROJECTS, type Project, type Decision } from '@/data';
import { UploadCloud, FileSpreadsheet, Sparkles, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

interface Extracted {
  name: string; sector: string; stage: string; teamSize: number;
  score: number; decision: Decision; include: boolean;
}

// Mock rows — stands in for parsed Excel content
const RAW_ROWS = [
  { name: 'منصة توصيل ذكية للأدوية', sector: 'الصحة', stage: 'منتج أولي (MVP)', team: 4 },
  { name: 'مساعد تعليمي بالواقع المعزز', sector: 'التعليم', stage: 'نموذج تجريبي', team: 3 },
  { name: 'تحليل ائتماني للمنشآت الصغيرة', sector: 'التقنية المالية', stage: 'إطلاق مبكر', team: 6 },
  { name: 'إدارة مخزون بالرؤية الحاسوبية', sector: 'التجارة', stage: 'منتج أولي (MVP)', team: 5 },
  { name: 'منصة استشارات زراعية', sector: 'الزراعة', stage: 'فكرة متقدمة', team: 2 },
];

function fakeScore(name: string, stage: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 1000;
  const boost = ['فكرة', 'فكرة متقدمة', 'نموذج تجريبي', 'منتج أولي (MVP)', 'إطلاق مبكر'].indexOf(stage) * 4;
  const score = Math.max(42, Math.min(90, 55 + (h % 28) + boost));
  const decision: Decision = score >= 75 ? 'direct' : score >= 60 ? 'conditional' : score >= 45 ? 'develop' : 'unsuitable';
  return { score, decision };
}

const DECISION_LABEL: Record<Decision, string> = {
  direct: 'احتضان مباشر', conditional: 'احتضان مشروط', develop: 'يحتاج تطوير', unsuitable: 'غير مناسب',
};
const DEC_STYLE: Record<Decision, string> = {
  direct: 'bg-[#006633]/10 text-[#006633] border-[#006633]/30',
  conditional: 'bg-amber-50 text-amber-700 border-amber-300',
  develop: 'bg-slate-100 text-slate-700 border-slate-300',
  unsuitable: 'bg-red-50 text-red-700 border-red-300',
};

export default function Import({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [rows, setRows] = useState<Extracted[]>([]);
  const [imported, setImported] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = (name: string) => {
    setFileName(name || 'projects-batch.xlsx');
    setStep(2);
    setProgress(0);
    // Simulate AI extraction progress
    let pct = 0;
    const timer = setInterval(() => {
      pct += 12 + Math.random() * 10;
      if (pct >= 100) {
        pct = 100;
        clearInterval(timer);
        setRows(RAW_ROWS.map((r) => {
          const { score, decision } = fakeScore(r.name, r.stage);
          return { name: r.name, sector: r.sector, stage: r.stage, teamSize: r.team, score, decision, include: true };
        }));
        setTimeout(() => setStep(3), 400);
      }
      setProgress(Math.round(pct));
    }, 300);
  };

  const toggleRow = (i: number) => setRows(rows.map((r, idx) => (idx === i ? { ...r, include: !r.include } : r)));

  const confirm = () => {
    const chosen = rows.filter((r) => r.include);
    chosen.forEach((r, i) => {
      const labels: [string, number][] = [['الابتكار والتميّز', 25], ['الجدوى التقنية', 25], ['حجم السوق والمنافسة', 20], ['قدرات الفريق', 15], ['النموذج المالي', 15]];
      const proj: Project = {
        id: `imp${Date.now()}-${i}`, code: `INC-${String(40 + PROJECTS.length + i).padStart(3, '0')}`,
        name: r.name, sector: r.sector, description: `مشروع مستورد من ملف Excel — ${r.name}.`,
        stage: r.stage, teamSize: r.teamSize, fundingAsk: 'غير محدد', status: 'evaluated',
        totalScore: r.score, decision: r.decision,
        criteria: labels.map(([label, weight], k) => ({ key: `c${k}`, label, weight, score: Math.max(40, Math.min(92, r.score + ((k - 2) * 3))) })),
        strengths: ['بيانات مستوردة بنجاح', 'تقييم أولي بالذكاء الاصطناعي'],
        weaknesses: ['يحتاج مراجعة بشرية للتفاصيل'],
        recommendations: ['استكمال البيانات الناقصة', 'مراجعة المقيّم'],
        plan: [{ phase: 'مراجعة', duration: 'أسبوعان', items: ['التحقق من البيانات المستوردة'] }],
        evaluatedAt: new Date().toISOString().slice(0, 10), modelId: 'claude-haiku-4-5',
      };
      PROJECTS.push(proj);
    });
    setImported(chosen.length);
    setStep(4);
  };

  const STEPS = ['رفع الملف', 'الاستخراج الذكي', 'المراجعة', 'تم'];

  return (
    <div className="max-w-3xl space-y-5">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => {
          const n = (i + 1) as Step;
          const done = step > n, active = step === n;
          return (
            <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${active || done ? 'text-primary' : 'text-muted-foreground'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  done ? 'bg-primary text-primary-foreground border-primary' : active ? 'border-primary' : 'border-border'
                }`}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : n}
                </span>
                <span className="text-xs font-semibold hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${done ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <Card>
          <CardContent className="pt-6">
            <button onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center gap-3 hover:border-primary hover:bg-secondary/40 transition-colors text-center">
              <UploadCloud className="w-10 h-10 text-primary" />
              <div className="font-semibold">اسحب ملف Excel هنا أو اضغط للاختيار</div>
              <p className="text-xs text-muted-foreground max-w-sm">
                يقرأ نموذج Claude الأعمدة تلقائياً ويستخرج بيانات كل مشروع — لا حاجة لتنسيق محدد. الصيغ المدعومة: .xlsx، .csv
              </p>
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0]?.name ?? '')} />
            <div className="text-center mt-4">
              <Button variant="outline" size="sm" onClick={() => pickFile('demo-projects.xlsx')}>
                <FileSpreadsheet className="w-4 h-4 me-2" /> استخدم ملفاً تجريبياً
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
            <div className="font-semibold flex items-center justify-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> يقرأ Claude الملف ويستخرج المشاريع...</div>
            <p className="text-xs text-muted-foreground" dir="ltr">{fileName}</p>
            <Progress value={progress} className="max-w-sm mx-auto" />
            <p className="text-xs text-muted-foreground">{progress}%</p>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">راجع المشاريع المستخرجة ({rows.filter((r) => r.include).length} من {rows.length} محددة)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="p-3 w-10"></th>
                    <th className="text-start p-3 font-semibold">المشروع</th>
                    <th className="text-start p-3 font-semibold">القطاع</th>
                    <th className="text-center p-3 font-semibold">الدرجة</th>
                    <th className="text-start p-3 font-semibold">القرار</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className={`border-b border-border last:border-0 ${!r.include ? 'opacity-45' : ''}`}>
                      <td className="p-3 text-center">
                        <input type="checkbox" checked={r.include} onChange={() => toggleRow(i)}
                          className="w-4 h-4 accent-[#006633]" aria-label={`تضمين ${r.name}`} />
                      </td>
                      <td className="p-3">
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-[11px] text-muted-foreground">{r.stage} · فريق {r.teamSize}</div>
                      </td>
                      <td className="p-3 text-muted-foreground">{r.sector}</td>
                      <td className="p-3 text-center font-bold">{r.score}</td>
                      <td className="p-3"><Badge variant="outline" className={DEC_STYLE[r.decision]}>{DECISION_LABEL[r.decision]}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button onClick={confirm} disabled={!rows.some((r) => r.include)} className="font-bold gap-2">
              <CheckCircle2 className="w-4 h-4" /> استيراد {rows.filter((r) => r.include).length} مشروعاً
            </Button>
            <Button variant="outline" onClick={() => setStep(1)}>إلغاء</Button>
          </div>
        </>
      )}

      {step === 4 && (
        <Card>
          <CardContent className="pt-10 pb-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="font-bold text-lg">تم استيراد {imported} مشروعاً بنجاح</div>
            <p className="text-sm text-muted-foreground">أُضيفت المشاريع إلى القائمة وظهرت في لوحة التحكم والتصنيفات.</p>
            <Button onClick={onDone} className="font-bold gap-2"><ArrowLeft className="w-4 h-4" /> عرض المشاريع</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
