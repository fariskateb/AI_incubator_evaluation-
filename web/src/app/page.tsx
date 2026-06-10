const KAU_GREEN = "#006633";
const KAU_DARK = "#004D26";
const KAU_GOLD = "#C9A227";

const CHECKLIST = [
  { label: "Next.js 16 (App Router, TypeScript, Turbopack)" },
  { label: "Tailwind CSS v4 + خط IBM Plex Sans Arabic (RTL)" },
  { label: "Drizzle ORM + مخطط قاعدة البيانات الكامل" },
  { label: "better-auth (بريد/كلمة مرور + أدوار + حظر)" },
  { label: "حارس الصلاحيات (RBAC) على الخادم" },
  { label: "اتصال Neon Postgres + سكربت البذرة" },
];

export default function Home() {
  return (
    <main
      className="flex-1 flex items-center justify-center p-6 text-white"
      style={{
        background: `linear-gradient(160deg, ${KAU_DARK} 0%, ${KAU_GREEN} 100%)`,
      }}
    >
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-11 h-11 rounded flex items-center justify-center text-xl font-bold"
            style={{ background: KAU_GOLD, color: KAU_DARK }}
          >
            ع
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">
              جامعة الملك عبدالعزيز
            </h1>
            <p className="text-white/70 text-sm">
              حاضنة الذكاء الاصطناعي — منصة التقييم
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white/10 backdrop-blur p-6 border border-white/15">
          <h2 className="font-bold mb-1">المرحلة 0 — الأساس جاهز ✓</h2>
          <p className="text-white/75 text-sm mb-5 leading-relaxed">
            تم تجهيز البنية الخلفية الحقيقية. الخطوة التالية: ربط قاعدة بيانات
            Neon وتشغيل الترحيلات، ثم بناء صفحات المصادقة ولوحة التحكم.
          </p>
          <ul className="space-y-2.5">
            {CHECKLIST.map((c) => (
              <li key={c.label} className="flex items-center gap-2.5 text-sm">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0"
                  style={{ background: KAU_GOLD, color: KAU_DARK }}
                >
                  ✓
                </span>
                {c.label}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/60 text-xs mt-6 text-center" dir="ltr">
          GET /api/health — verify the database connection
        </p>
      </div>
    </main>
  );
}
