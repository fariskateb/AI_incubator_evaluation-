import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Landing from '@/views/Landing';
import Login from '@/views/Login';
import Dashboard from '@/views/Dashboard';
import Projects from '@/views/Projects';
import Report from '@/views/Report';
import Admin from '@/views/Admin';
import NewProject from '@/views/NewProject';
import Rankings from '@/views/Rankings';
import Compare from '@/views/Compare';
import Import from '@/views/Import';
import { PROJECTS, ROLE_LABEL, type Role, type User } from '@/data';
import { LayoutDashboard, FolderOpen, Settings, LogOut, Sparkles, FileText, Home, ArrowRight, Trophy, GitCompare, FileSpreadsheet } from 'lucide-react';

type View = 'dashboard' | 'projects' | 'report' | 'admin' | 'my-project' | 'new-project' | 'rankings' | 'compare' | 'import';

const KAU_GOLD = '#C9A227';
const KAU_DARK = '#004D26';

const NAV: { id: View; label: string; icon: typeof LayoutDashboard; roles: Role[] }[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, roles: ['admin', 'evaluator', 'investor'] },
  { id: 'projects', label: 'المشاريع', icon: FolderOpen, roles: ['admin', 'evaluator', 'investor'] },
  { id: 'rankings', label: 'التصنيفات', icon: Trophy, roles: ['admin', 'evaluator', 'investor'] },
  { id: 'compare', label: 'المقارنة', icon: GitCompare, roles: ['admin', 'evaluator', 'investor'] },
  { id: 'import', label: 'استيراد Excel', icon: FileSpreadsheet, roles: ['admin', 'evaluator'] },
  { id: 'my-project', label: 'مشروعي', icon: FileText, roles: ['student'] },
  { id: 'admin', label: 'الإدارة', icon: Settings, roles: ['admin'] },
];

const ROLE_BADGE: Record<Role, string> = {
  admin: 'bg-[#C9A227]/10 text-amber-800 border-[#C9A227]/40',
  evaluator: 'bg-[#006633]/10 text-[#006633] border-[#006633]/30',
  investor: 'bg-sky-50 text-sky-700 border-sky-300',
  student: 'bg-emerald-50 text-emerald-700 border-emerald-300',
};

const TITLES: Record<View, { t: string; s: string }> = {
  dashboard: { t: 'لوحة التحكم', s: 'نظرة عامة على مشاريع الدفعة الحالية' },
  projects: { t: 'المشاريع', s: 'جميع المشاريع المُقيَّمة في الحاضنة' },
  report: { t: 'التقرير التفصيلي', s: 'تقييم شامل بالذكاء الاصطناعي' },
  admin: { t: 'الإدارة', s: 'المستخدمون والدعوات وإعدادات النظام' },
  'my-project': { t: 'مشروعي', s: 'حالة مشروعك ونتيجة التقييم' },
  'new-project': { t: 'إضافة مشروع جديد', s: 'أدخل بيانات المشروع للحصول على تقييم ذكي' },
  rankings: { t: 'التصنيفات والترتيب', s: 'ترتيب المشاريع حسب معايير مختلفة' },
  compare: { t: 'مقارنة المشاريع', s: 'مقارنة تفصيلية مع توصيات الاستثمار' },
  import: { t: 'استيراد من Excel', s: 'ارفع ملفاً ليقرأه Claude ويستخرج المشاريع تلقائياً' },
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<'landing' | 'login'>('landing');
  const [view, setView] = useState<View>('dashboard');
  const [history, setHistory] = useState<View[]>([]);
  const [reportId, setReportId] = useState<string>('p1');

  if (!user) {
    if (screen === 'landing') return <Landing onLoginClick={() => setScreen('login')} />;
    return (
      <Login
        onBack={() => setScreen('landing')}
        onLogin={(u) => {
          setUser(u);
          setHistory([]);
          setView(u.role === 'student' ? 'my-project' : 'dashboard');
        }}
      />
    );
  }

  const homeView: View = user.role === 'student' ? 'my-project' : 'dashboard';

  const go = (v: View) => {
    if (v === view) return;
    setHistory((h) => [...h, view]);
    setView(v);
  };

  const goBack = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const nh = [...h];
      setView(nh.pop()!);
      return nh;
    });
  };

  const openReport = (id: string) => {
    setReportId(id);
    go('report');
  };

  const logout = () => {
    setUser(null);
    setHistory([]);
    setScreen('landing');
  };

  const myProject = PROJECTS.find((p) => p.ownerId === user.id);
  const nav = NAV.filter((n) => n.roles.includes(user.role));

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (right side in RTL) */}
      <aside className="w-56 shrink-0 border-e border-border bg-card flex flex-col sticky top-0 h-screen print:hidden">
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
          <div className="w-7 h-7 flex items-center justify-center rounded-sm" style={{ background: KAU_GOLD, color: KAU_DARK }}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-[13px]">جامعة الملك عبدالعزيز</div>
            <div className="text-[10px] text-muted-foreground">حاضنة الذكاء الاصطناعي</div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {nav.map((n) => {
            const active = view === n.id || (n.id === 'projects' && (view === 'report' || view === 'new-project') && user.role !== 'student');
            return (
              <button key={n.id} onClick={() => go(n.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm transition-colors ${
                  active ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}>
                <n.icon className="w-4 h-4" /> {n.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
              {user.name[0]}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">{user.name}</div>
              <Badge variant="outline" className={`${ROLE_BADGE[user.role]} text-[10px] px-1.5 py-0`}>{ROLE_LABEL[user.role]}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground"
            onClick={logout}>
            <LogOut className="w-3.5 h-3.5" /> تسجيل الخروج
          </Button>
          <div className="text-center text-[10px] text-muted-foreground mt-2 font-semibold" dir="ltr">kau.edu.sa</div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <div className="border-b border-border bg-card px-6 py-3 flex items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-lg font-bold">{TITLES[view].t}</h1>
            <p className="text-xs text-muted-foreground">{TITLES[view].s}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={goBack} disabled={history.length === 0}>
              <ArrowRight className="w-4 h-4" /> رجوع
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={() => go(homeView)} disabled={view === homeView}>
              <Home className="w-4 h-4" /> الرئيسية
            </Button>
          </div>
        </div>
        <div className="p-6 print:p-0">
          {view === 'dashboard' && <Dashboard openReport={openReport} />}
          {view === 'projects' && <Projects role={user.role} openReport={openReport} onNew={() => go('new-project')} />}
          {view === 'report' && <Report id={reportId} role={user.role} back={goBack} />}
          {view === 'new-project' && <NewProject onCreated={openReport} />}
          {view === 'rankings' && <Rankings openReport={openReport} />}
          {view === 'compare' && <Compare openReport={openReport} />}
          {view === 'import' && <Import onDone={() => go('projects')} />}
          {view === 'admin' && <Admin />}
          {view === 'my-project' &&
            (myProject ? (
              <Report id={myProject.id} role={user.role} />
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">لم تقدّم مشروعاً بعد — أدخل بيانات مشروعك للحصول على التقييم.</p>
                <NewProject ownerId={user.id} onCreated={(id) => { setReportId(id); setView('my-project'); }} />
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
