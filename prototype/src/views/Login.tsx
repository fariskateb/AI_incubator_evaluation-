import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { USERS, type User, ROLE_LABEL } from '@/data';
import { Sparkles, ShieldCheck, Database, ServerCog, ArrowRight } from 'lucide-react';

const KAU_GREEN = '#006633';
const KAU_DARK = '#004D26';
const KAU_GOLD = '#C9A227';

export default function Login({ onLogin, onBack }: { onLogin: (u: User) => void; onBack?: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const submitLogin = () => {
    const u = USERS.find((x) => x.email === email.trim());
    if (!u || password.length < 4) {
      setError('بيانات الدخول غير صحيحة — جرّب أحد الحسابات التجريبية أدناه');
      return;
    }
    onLogin(u);
  };

  const submitSignup = () => {
    if (name.trim().length < 2) { setError('أدخل الاسم الكامل'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setError('أدخل بريداً إلكترونياً صحيحاً'); return; }
    if (USERS.some((u) => u.email === email.trim())) { setError('هذا البريد مسجّل بالفعل — سجّل الدخول'); return; }
    if (password.length < 8) { setError('كلمة المرور 8 أحرف على الأقل'); return; }
    if (password2 !== password) { setError('كلمتا المرور غير متطابقتين'); return; }
    const u: User = { id: `u${Date.now()}`, name: name.trim(), email: email.trim(), role: 'student', lastLogin: 'الآن' };
    USERS.push(u);
    onLogin(u);
  };

  const submit = () => (mode === 'login' ? submitLogin() : submitSignup());

  const quick = (u: User) => {
    setMode('login');
    setEmail(u.email);
    setPassword('demo-pass');
    setError('');
  };

  const switchMode = (m: 'login' | 'signup') => {
    setMode(m);
    setError('');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Brand panel (right in RTL) — KAU green */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] p-12 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${KAU_DARK} 0%, ${KAU_GREEN} 100%)` }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,162,39,0.2), transparent 70%)' }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 flex items-center justify-center rounded-sm" style={{ background: KAU_GOLD, color: KAU_DARK }}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">جامعة الملك عبدالعزيز</div>
              <div className="text-xs text-white/70">حاضنة الذكاء الاصطناعي — منصة التقييم</div>
            </div>
          </div>
          <h1 className="text-3xl font-bold leading-snug mb-4">
            تقييم مشاريع ريادية
            <br />
            <span style={{ color: '#E8C84F' }}>بذكاء، وبأمان حقيقي.</span>
          </h1>
          <p className="text-white/75 leading-relaxed max-w-md">
            خادم حقيقي، قاعدة بيانات PostgreSQL، ومصادقة آمنة — بهوية جامعة الملك عبدالعزيز.
          </p>
        </div>
        <div className="relative space-y-3 text-sm">
          <div className="flex items-center gap-3 text-white/75">
            <ShieldCheck className="w-4 h-4" style={{ color: KAU_GOLD }} /> جلسات آمنة + صلاحيات تُفرض على الخادم
          </div>
          <div className="flex items-center gap-3 text-white/75">
            <Database className="w-4 h-4" style={{ color: KAU_GOLD }} /> بيانات دائمة في Postgres (Neon) — لا localStorage
          </div>
          <div className="flex items-center gap-3 text-white/75">
            <ServerCog className="w-4 h-4" style={{ color: KAU_GOLD }} /> استدعاءات Claude من الخادم — المفتاح لا يصل للمتصفح
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6">
              <ArrowRight className="w-3.5 h-3.5" /> العودة للصفحة الرئيسية
            </button>
          )}

          {/* Mode switch */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-secondary rounded-md mb-7" role="tablist" aria-label="نوع الدخول">
            <button role="tab" aria-selected={mode === 'login'} onClick={() => switchMode('login')}
              className={`py-2 text-sm font-semibold rounded transition-colors ${mode === 'login' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              تسجيل الدخول
            </button>
            <button role="tab" aria-selected={mode === 'signup'} onClick={() => switchMode('signup')}
              className={`py-2 text-sm font-semibold rounded transition-colors ${mode === 'signup' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              مستخدم جديد
            </button>
          </div>

          <div className="mb-7">
            <h2 className="text-xl font-bold mb-1">{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب طالب'}</h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'login'
                ? 'ادخل بحسابك الجامعي.'
                : 'التسجيل الذاتي متاح للطلاب فقط — حسابات المقيّمين والمستثمرين تُنشأ بدعوة من المشرف.'}
            </p>
          </div>

          <div className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="signup-name">الاسم الكامل</Label>
                <Input id="signup-name" autoComplete="name" className="bg-card" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: نورة الشهري" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="login-email">البريد الإلكتروني الجامعي</Label>
              <Input id="login-email" type="email" autoComplete="email" dir="ltr" className="text-left bg-card" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'signup' ? 'name@stu.kau.edu.sa' : 'name@kau.edu.sa'} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-pass">كلمة المرور</Label>
              <Input id="login-pass" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} dir="ltr" className="text-left bg-card" type="password"
                value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
              {mode === 'signup' && <p className="text-[11px] text-muted-foreground">8 أحرف على الأقل. سيصلك بريد لتفعيل الحساب في النسخة الكاملة.</p>}
            </div>
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="signup-pass2">تأكيد كلمة المرور</Label>
                <Input id="signup-pass2" autoComplete="new-password" dir="ltr" className="text-left bg-card" type="password"
                  value={password2} onChange={(e) => setPassword2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
              </div>
            )}
            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
            <Button className="w-full font-bold" onClick={submit}>
              {mode === 'login' ? 'دخول' : 'إنشاء الحساب'}
            </Button>
            {mode === 'login' && (
              <button className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
                نسيت كلمة المرور؟
              </button>
            )}
          </div>

          {mode === 'login' && (
            <div className="mt-9 border-t border-border pt-5">
              <div className="text-[11px] text-muted-foreground mb-3">نموذج أولي — ادخل بحساب تجريبي:</div>
              <div className="flex flex-wrap gap-2">
                {USERS.filter((u) => ['u1', 'u2', 'u4', 'u5'].includes(u.id)).map((u) => (
                  <button key={u.id} onClick={() => quick(u)}>
                    <Badge variant="outline" className="cursor-pointer bg-card hover:border-primary hover:text-primary transition-colors">
                      {ROLE_LABEL[u.role]} · {u.name}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-9 text-center text-[11px] text-muted-foreground">
            جميع الحقوق محفوظة لجامعة الملك عبدالعزيز · <span dir="ltr" style={{ color: KAU_GREEN }} className="font-semibold">kau.edu.sa</span>
          </p>
        </div>
      </div>
    </div>
  );
}
