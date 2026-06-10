import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PROJECTS, type Project, type Decision } from '@/data';
import { Sparkles, Loader2, ChevronDown, ListPlus } from 'lucide-react';

const SECTOR_OPTIONS = ['التقنية المالية', 'الصحة', 'التعليم', 'الاتصالات', 'الزراعة', 'الخدمات القانونية', 'التجارة', 'السياحة', 'الطاقة', 'أخرى'];
const STAGE_OPTIONS = ['فكرة', 'فكرة متقدمة', 'نموذج تجريبي', 'منتج أولي (MVP)', 'إطلاق مبكر'];

// Deterministic mock evaluation — stands in for the server-side Claude call.
// Filled optional details slightly raise the score: more context = better evaluation.
function mockEvaluate(name: string, desc: string, stage: string, teamSize: number, detailsCount: number) {
  let h = 0;
  for (const ch of name + desc) h = (h * 31 + ch.charCodeAt(0)) % 1000;
  const stageBoost = STAGE_OPTIONS.indexOf(stage) * 3;
  const base = 50 + (h % 22) + stageBoost + Math.min(teamSize, 6) + Math.min(detailsCount, 6);
  const clamp = (n: number) => Math.max(35, Math.min(93, Math.round(n)));
  const scores = [clamp(base + (h % 7)), clamp(base - 4 + (h % 5)), clamp(base - 2 + (h % 9)), clamp(base - 6 + (h % 6)), clamp(base - 5 + (h % 8))];
  const total = Math.round(scores[0] * 0.25 + scores[1] * 0.25 + scores[2] * 0.2 + scores[3] * 0.15 + scores[4] * 0.15);
  const decision: Decision = total >= 75 ? 'direct' : total >= 60 ? 'conditional' : total >= 45 ? 'develop' : 'unsuitable';
  return { scores, total, decision };
}

const OPTIONAL_FIELDS: { key: string; label: string; placeholder: string; multiline?: boolean }[] = [
  { key: 'target', label: 'الفئة المستهدفة', placeholder: 'من هم عملاؤك؟ مثال: المدارس الأهلية في جدة' },
  { key: 'market', label: 'حجم السوق المتوقع', placeholder: 'مثال: 200 مليون ريال سنوياً في السعودية' },
  { key: 'competitors', label: 'المنافسون الحاليون', placeholder: 'من يحل المشكلة اليوم؟ وما تميّزك عنهم؟', multiline: true },
  { key: 'ai', label: 'كيف يُستخدم الذكاء الاصطناعي؟', placeholder: 'النماذج أو التقنيات المستخدمة ودورها في المنتج', multiline: true },
  { key: 'revenue', label: 'نموذج الإيرادات', placeholder: 'مثال: اشتراك شهري، عمولة على كل عملية' },
  { key: 'traction', label: 'الإنجازات حتى الآن', placeholder: 'مستخدمون، إيرادات، شراكات، جوائز...', multiline: true },
];

const OPTIONAL_LABELS: Record<string, string> = Object.fromEntries(OPTIONAL_FIELDS.map((f) => [f.key, f.label]));

export default function NewProject({ onCreated, ownerId }: { onCreated: (id: string) => void; ownerId?: string }) {
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [teamSize, setTeamSize] = useState('3');
  const [fundingAsk, setFundingAsk] = useState('');
  const [desc, setDesc] = useState('');
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [showExtra, setShowExtra] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const filledExtra = Object.values(extra).filter((v) => v.trim().length > 0).length;

  const submit = () => {
    if (name.trim().length < 2) { setError('أدخل اسم المشروع (حرفان على الأقل)'); return; }
    if (!sector) { setError('اختر القطاع'); return; }
    if (!stage) { setError('اختر مرحلة المشروع'); return; }
    if (desc.trim().length < 20) { setError('اكتب وصفاً لا يقل عن 20 حرفاً'); return; }
    setError('');
    setBusy(true);

    setTimeout(() => {
      const { scores, total, decision } = mockEvaluate(name, desc, stage, Number(teamSize) || 3, filledExtra);
      const id = `p${Date.now()}`;
      const labels: [string, number][] = [['الابتكار والتميّز', 25], ['الجدوى التقنية', 25], ['حجم السوق والمنافسة', 20], ['قدرات الفريق', 15], ['النموذج المالي', 15]];
      const details = OPTIONAL_FIELDS
        .filter((f) => (extra[f.key] ?? '').trim().length > 0)
        .map((f) => ({ label: OPTIONAL_LABELS[f.key], value: extra[f.key].trim() }));
      const project: Project = {
        id, code: `INC-${String(36 + PROJECTS.length).padStart(3, '0')}`, name: name.trim(), sector,
        description: desc.trim(), stage, teamSize: Number(teamSize) || 3, fundingAsk: fundingAsk.trim() || 'غير محدد',
        ownerId, status: 'evaluated', totalScore: total, decision,
        criteria: labels.map(([label, weight], i) => ({ key: `c${i}`, label, weight, score: scores[i] })),
        strengths: ['فكرة واضحة قابلة للتطوير', 'توافق مع توجهات الحاضنة في الذكاء الاصطناعي'],
        weaknesses: ['يحتاج التحقق من السوق بمقابلات مع عملاء حقيقيين', 'النموذج المالي يحتاج تفصيلاً أدق'],
        recommendations: ['إجراء 15 مقابلة مع العملاء المستهدفين خلال الشهر الأول', 'بناء نموذج أولي مركّز على الميزة الأساسية'],
        plan: [
          { phase: 'التأسيس', duration: '4 أسابيع', items: ['التحقق من المشكلة مع المستخدمين', 'تحديد مؤشرات النجاح'] },
          { phase: 'النمو', duration: '8 أسابيع', items: ['بناء النموذج الأولي', 'تجربة مع مستخدمين تجريبيين'] },
          { phase: 'التوسع', duration: '12 أسبوع', items: ['قياس النتائج وإعادة التقييم', 'الاستعداد لجولة تمويل'] },
        ],
        details: details.length ? details : undefined,
        evaluatedAt: new Date().toISOString().slice(0, 10), modelId: 'claude-sonnet-4-6',
      };
      PROJECTS.push(project);
      setBusy(false);
      onCreated(id);
    }, 1800);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> بيانات المشروع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="np-name">اسم المشروع *</Label>
              <Input id="np-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: منصة تحليل ذكي" />
            </div>
            <div className="space-y-1.5">
              <Label id="np-sector">القطاع *</Label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger aria-labelledby="np-sector"><SelectValue placeholder="اختر القطاع" /></SelectTrigger>
                <SelectContent>{SECTOR_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label id="np-stage">مرحلة المشروع *</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger aria-labelledby="np-stage"><SelectValue placeholder="اختر المرحلة" /></SelectTrigger>
                <SelectContent>{STAGE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="np-team">حجم الفريق</Label>
              <Input id="np-team" type="number" min="1" max="20" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="np-ask">طلب التمويل (اختياري)</Label>
              <Input id="np-ask" value={fundingAsk} onChange={(e) => setFundingAsk(e.target.value)} placeholder="مثال: 500 ألف ريال" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="np-desc">وصف المشروع والمشكلة التي يحلها *</Label>
              <Textarea id="np-desc" rows={5} value={desc} onChange={(e) => setDesc(e.target.value)}
                placeholder="اشرح فكرة المشروع، المشكلة، الفئة المستهدفة، وكيف يُستخدم الذكاء الاصطناعي..." />
              <p className="text-[11px] text-muted-foreground">{desc.trim().length} / 20 حرفاً كحد أدنى</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional details — improve evaluation quality */}
      <Card>
        <CardHeader className="pb-3">
          <button type="button" onClick={() => setShowExtra(!showExtra)} aria-expanded={showExtra}
            className="w-full flex items-center justify-between gap-2 text-start">
            <CardTitle className="text-sm flex items-center gap-2">
              <ListPlus className="w-4 h-4 text-primary" /> معلومات تفصيلية (اختياري)
              {filledExtra > 0 && <span className="text-[11px] font-normal text-primary">{filledExtra} من {OPTIONAL_FIELDS.length} مكتملة</span>}
            </CardTitle>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showExtra ? 'rotate-180' : ''}`} />
          </button>
          <p className="text-[11px] text-muted-foreground">
            كلما أضفت تفاصيل أكثر، حصل التقييم الذكي على صورة أدق لمشروعك وكانت التوصيات أفضل.
          </p>
        </CardHeader>
        {showExtra && (
          <CardContent className="space-y-4 pt-0">
            <div className="grid sm:grid-cols-2 gap-4">
              {OPTIONAL_FIELDS.map((f) => (
                <div key={f.key} className={`space-y-1.5 ${f.multiline ? 'sm:col-span-2' : ''}`}>
                  <Label htmlFor={`np-${f.key}`}>{f.label}</Label>
                  {f.multiline ? (
                    <Textarea id={`np-${f.key}`} rows={2} value={extra[f.key] ?? ''} placeholder={f.placeholder}
                      onChange={(e) => setExtra({ ...extra, [f.key]: e.target.value })} />
                  ) : (
                    <Input id={`np-${f.key}`} value={extra[f.key] ?? ''} placeholder={f.placeholder}
                      onChange={(e) => setExtra({ ...extra, [f.key]: e.target.value })} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardContent className="pt-5 space-y-3">
          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
          <Button onClick={submit} disabled={busy} className="font-bold gap-2 min-w-44">
            {busy ? (<><Loader2 className="w-4 h-4 animate-spin" /> جاري التقييم بالذكاء الاصطناعي...</>) : (<><Sparkles className="w-4 h-4" /> إرسال للتقييم الذكي</>)}
          </Button>
          <p className="text-[11px] text-muted-foreground">
            في النسخة الكاملة يُرسل المشروع إلى الخادم ويقيّمه نموذج Claude — هنا يُحاكى التقييم محلياً للعرض.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
