import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ShieldCheck, Database, BrainCircuit, ArrowLeft } from 'lucide-react';

const KAU_GREEN = '#006633';
const KAU_DARK = '#004D26';
const KAU_GOLD = '#C9A227';
const KAU_INK = '#00331A'; // text on gold — passes 4.5:1

export default function Landing({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar — translucent KAU green */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10"
        style={{ background: 'rgba(0, 77, 38, 0.92)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 rounded-sm flex items-center justify-center" style={{ background: KAU_GOLD, color: KAU_DARK }}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-sm">جامعة الملك عبدالعزيز</div>
              <div className="text-[11px] text-white/70">حاضنة الذكاء الاصطناعي — منصة التقييم</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={onLoginClick} className="font-bold border-0" style={{ background: KAU_GOLD, color: KAU_INK }}>
              تسجيل الدخول
            </Button>
          </div>
        </div>
      </header>

      <main>
      {/* Hero — deep KAU green gradient + gold radial glow */}
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${KAU_DARK} 0%, ${KAU_GREEN} 100%)` }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,162,39,0.25), transparent 70%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full border mb-6"
            style={{ borderColor: 'rgba(201,162,39,0.5)', color: '#E8C84F', background: 'rgba(255,255,255,0.06)' }}
          >
            <Sparkles className="w-3.5 h-3.5" /> جامعة الملك عبدالعزيز · حاضنة الذكاء الاصطناعي
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold leading-snug mb-5 bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to left, #FFFFFF 40%, #E8C84F)' }}
          >
            تقييم المشاريع الريادية
            <br />
            بذكاء اصطناعي، بمعايير الجامعة
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto leading-relaxed mb-9">
            منصة متخصصة في تقييم مشاريع الطلبة لحظة قبولهم في الحاضنة، وهي متاحة لجميع المتقدمين
            للحصول على تقييم مبدئي باستخدام الذكاء الاصطناعي — مع تقارير تفصيلية وخطط عمل لكل مشروع.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" onClick={onLoginClick} className="font-bold gap-2 border-0 text-base px-7"
              style={{ background: KAU_GOLD, color: KAU_INK }}>
              ابدأ الآن <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={onLoginClick}
              className="font-bold text-base px-7 bg-transparent border-white/70 text-white hover:bg-white/10 hover:text-white">
              دخول الطلاب
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-4 w-full">
        {[
          { icon: BrainCircuit, t: 'تقييم ذكي شامل', d: 'تحليل بخمسة معايير مرجّحة مع نقاط القوة والضعف وخطة عمل مرحلية لكل مشروع.' },
          { icon: ShieldCheck, t: 'أمان وصلاحيات حقيقية', d: 'حسابات بالدعوة فقط، جلسات آمنة، وصلاحيات تُفرض على الخادم حسب الدور.' },
          { icon: Database, t: 'بيانات دائمة وموثوقة', d: 'قاعدة بيانات PostgreSQL مع سجلّ تدقيق كامل ونسخ احتياطي — لا شيء يُفقد.' },
        ].map((f) => (
          <Card key={f.t}>
            <CardContent className="pt-6">
              <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-3"
                style={{ background: 'rgba(0,102,51,0.08)', color: KAU_GREEN }}>
                <f.icon className="w-5 h-5" />
              </div>
              <div className="font-bold mb-1.5">{f.t}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>جميع الحقوق محفوظة لجامعة الملك عبدالعزيز © 2026</span>
          <span className="font-semibold" dir="ltr" style={{ color: KAU_GREEN }}>kau.edu.sa</span>
        </div>
      </footer>
    </div>
  );
}
