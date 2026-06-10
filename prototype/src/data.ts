export type Role = 'admin' | 'evaluator' | 'investor' | 'student';
export type Decision = 'direct' | 'conditional' | 'develop' | 'unsuitable';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  banned?: boolean;
  lastLogin: string;
}

export interface Criterion {
  key: string;
  label: string;
  score: number; // 0-100
  weight: number;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  sector: string;
  description: string;
  stage: string;
  teamSize: number;
  fundingAsk: string;
  ownerId?: string;
  status: 'draft' | 'submitted' | 'evaluating' | 'evaluated';
  totalScore: number;
  decision: Decision;
  criteria: Criterion[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  plan: { phase: string; duration: string; items: string[] }[];
  details?: { label: string; value: string }[];
  evaluatedAt: string;
  modelId: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: Role;
  invitedBy: string;
  sentAt: string;
  status: 'pending' | 'accepted' | 'expired';
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'مشرف',
  evaluator: 'مقيّم',
  investor: 'مستثمر',
  student: 'طالب',
};

export const DECISION_LABEL: Record<Decision, string> = {
  direct: 'احتضان مباشر',
  conditional: 'احتضان مشروط',
  develop: 'يحتاج تطوير',
  unsuitable: 'غير مناسب',
};

export const USERS: User[] = [
  { id: 'u1', name: 'المشرف العام', email: 'admin@kau.edu.sa', role: 'admin', lastLogin: 'اليوم 09:14' },
  { id: 'u2', name: 'د. سارة المالكي', email: 's.almalki@kau.edu.sa', role: 'evaluator', lastLogin: 'اليوم 08:02' },
  { id: 'u3', name: 'م. خالد العتيبي', email: 'k.alotaibi@kau.edu.sa', role: 'evaluator', lastLogin: 'أمس 16:40' },
  { id: 'u4', name: 'رؤية كابيتال', email: 'deals@ruyacapital.sa', role: 'investor', lastLogin: 'قبل 3 أيام' },
  { id: 'u5', name: 'نورة الشهري', email: 'noura.s@stu.kau.edu.sa', role: 'student', lastLogin: 'اليوم 10:21' },
  { id: 'u6', name: 'عبدالله الزهراني', email: 'abdullah.z@stu.kau.edu.sa', role: 'student', lastLogin: 'أمس 13:05' },
];

export const INVITATIONS: Invitation[] = [
  { id: 'i1', email: 'm.alqahtani@kau.edu.sa', role: 'evaluator', invitedBy: 'المشرف العام', sentAt: 'قبل يومين', status: 'pending' },
  { id: 'i2', email: 'fund@oasisvc.sa', role: 'investor', invitedBy: 'المشرف العام', sentAt: 'قبل 5 أيام', status: 'accepted' },
  { id: 'i3', email: 'lama.h@stu.kau.edu.sa', role: 'student', invitedBy: 'د. سارة المالكي', sentAt: 'قبل أسبوع', status: 'expired' },
];

const C = (innovation: number, tech: number, market: number, team: number, finance: number): Criterion[] => [
  { key: 'innovation', label: 'الابتكار والتميّز', score: innovation, weight: 25 },
  { key: 'tech', label: 'الجدوى التقنية', score: tech, weight: 25 },
  { key: 'market', label: 'حجم السوق والمنافسة', score: market, weight: 20 },
  { key: 'team', label: 'قدرات الفريق', score: team, weight: 15 },
  { key: 'finance', label: 'النموذج المالي', score: finance, weight: 15 },
];

export const PROJECTS: Project[] = [
  {
    id: 'p1', code: 'INC-024', name: 'منصة كشف الاحتيال المالي', sector: 'التقنية المالية',
    description: 'نظام ذكاء اصطناعي لكشف المعاملات الاحتيالية في الوقت الفعلي للبنوك وشركات المدفوعات باستخدام التعلم العميق.',
    stage: 'منتج أولي (MVP)', teamSize: 5, fundingAsk: '1.2 مليون ريال', status: 'evaluated',
    totalScore: 88, decision: 'direct', criteria: C(92, 88, 90, 82, 84),
    strengths: ['فريق تقني قوي بخبرة مصرفية سابقة', 'نموذج مدرّب على بيانات حقيقية بدقة 97%', 'اتفاقية تجريبية موقعة مع بنك محلي'],
    weaknesses: ['الاعتماد على عميل تجريبي واحد', 'متطلبات الامتثال التنظيمي (ساما) لم تكتمل'],
    recommendations: ['التقدم لبيئة ساما التنظيمية التجريبية خلال الربع القادم', 'توسيع قاعدة العملاء التجريبيين إلى 3 جهات'],
    plan: [
      { phase: 'التأسيس', duration: '4 أسابيع', items: ['استكمال متطلبات الامتثال', 'تعيين مسؤول أمن معلومات'] },
      { phase: 'النمو', duration: '8 أسابيع', items: ['إطلاق تجريبي مع بنكين إضافيين', 'بناء لوحة تحكم للعملاء'] },
      { phase: 'التوسع', duration: '12 أسبوع', items: ['جولة استثمارية بذرية', 'التوسع لدول الخليج'] },
    ],
    evaluatedAt: '2026-06-08', modelId: 'claude-sonnet-4-6',
  },
  {
    id: 'p2', code: 'INC-019', name: 'منصة تشخيص طبي مساعد', sector: 'الصحة',
    description: 'مساعد تشخيصي يحلل صور الأشعة ويقترح تشخيصات أولية للأطباء في المناطق النائية.',
    stage: 'نموذج تجريبي', teamSize: 4, fundingAsk: '900 ألف ريال', status: 'evaluated',
    totalScore: 85, decision: 'direct', criteria: C(90, 84, 86, 80, 78),
    strengths: ['شراكة بحثية مع كلية الطب', 'حاجة سوقية واضحة وموثقة', 'دقة نموذج تنافسية عالمياً'],
    weaknesses: ['مسار الترخيص الطبي طويل', 'لا يوجد متخصص تنظيمي في الفريق'],
    recommendations: ['البدء بمسار "أداة مساعدة للطبيب" لتسريع الترخيص', 'ضم مستشار شؤون تنظيمية صحية'],
    plan: [
      { phase: 'التأسيس', duration: '6 أسابيع', items: ['خارطة طريق الترخيص مع هيئة الغذاء والدواء', 'دراسة سريرية مصغرة'] },
      { phase: 'النمو', duration: '10 أسابيع', items: ['تجربة ميدانية في مستشفيين', 'نشر ورقة علمية'] },
      { phase: 'التوسع', duration: '12 أسبوع', items: ['التقديم على الترخيص', 'جولة تمويل'] },
    ],
    evaluatedAt: '2026-06-05', modelId: 'claude-sonnet-4-6',
  },
  {
    id: 'p3', code: 'INC-027', name: 'منصة تعليم تكيفي', sector: 'التعليم',
    description: 'منصة تعلم تخصص المحتوى تلقائياً حسب مستوى الطالب باستخدام نماذج لغوية عربية.',
    stage: 'منتج أولي (MVP)', teamSize: 3, fundingAsk: '600 ألف ريال', ownerId: 'u5', status: 'evaluated',
    totalScore: 81, decision: 'direct', criteria: C(84, 80, 82, 76, 78),
    strengths: ['دعم عربي أصيل نادر في السوق', '1,200 مستخدم تجريبي نشط', 'نمو شهري 22%'],
    weaknesses: ['تكلفة الاستدلال مرتفعة لكل مستخدم', 'نموذج الإيرادات غير محسوم'],
    recommendations: ['اختبار نموذج اشتراك المدارس بدلاً من الأفراد', 'تحسين تكاليف الاستدلال بالنماذج الصغيرة'],
    plan: [
      { phase: 'التأسيس', duration: '4 أسابيع', items: ['تجربة تسعير مع 5 مدارس', 'خفض تكلفة الاستدلال 40%'] },
      { phase: 'النمو', duration: '8 أسابيع', items: ['إطلاق بوابة المعلم', 'تكامل مع أنظمة إدارة التعلم'] },
      { phase: 'التوسع', duration: '12 أسبوع', items: ['عقود مع إدارات تعليم', 'توسيع المناهج'] },
    ],
    evaluatedAt: '2026-06-09', modelId: 'claude-sonnet-4-6',
  },
  {
    id: 'p4', code: 'INC-031', name: 'روبوت محادثة عربي للشركات', sector: 'الاتصالات',
    description: 'روبوت خدمة عملاء يفهم اللهجات العربية المحلية ويتكامل مع قنوات التواصل الشائعة.',
    stage: 'إطلاق مبكر', teamSize: 6, fundingAsk: '1.5 مليون ريال', status: 'evaluated',
    totalScore: 77, decision: 'conditional', criteria: C(74, 82, 78, 76, 70),
    strengths: ['12 عميل مدفوع', 'فهم لهجات متفوق على المنافسين'],
    weaknesses: ['منافسة شديدة من حلول عالمية', 'تكلفة اكتساب العميل مرتفعة'],
    recommendations: ['التركيز على قطاع واحد (الصحة أو الحكومة) للتمايز', 'بناء قنوات شراكة بدل البيع المباشر'],
    plan: [
      { phase: 'التأسيس', duration: '4 أسابيع', items: ['اختيار القطاع المستهدف', 'دراسة تنافسية معمقة'] },
      { phase: 'النمو', duration: '8 أسابيع', items: ['3 شراكات توزيع', 'خفض تكلفة الاكتساب 30%'] },
      { phase: 'التوسع', duration: '12 أسبوع', items: ['التوسع الإقليمي', 'جولة تمويل'] },
    ],
    evaluatedAt: '2026-06-02', modelId: 'claude-sonnet-4-6',
  },
  {
    id: 'p5', code: 'INC-022', name: 'نظام ري ذكي بالاستشعار', sector: 'الزراعة',
    description: 'حساسات وذكاء اصطناعي لتحسين استهلاك المياه في المزارع وخفض الهدر حتى 35%.',
    stage: 'نموذج تجريبي', teamSize: 4, fundingAsk: '750 ألف ريال', status: 'evaluated',
    totalScore: 72, decision: 'conditional', criteria: C(70, 76, 68, 74, 70),
    strengths: ['أثر بيئي قابل للقياس', 'توافق مع مستهدفات رؤية 2030 المائية'],
    weaknesses: ['دورة بيع طويلة مع المزارع الكبيرة', 'تكلفة العتاد الأولية مرتفعة'],
    recommendations: ['نموذج تأجير العتاد بدل البيع', 'استهداف برامج الدعم الحكومي الزراعي'],
    plan: [
      { phase: 'التأسيس', duration: '6 أسابيع', items: ['تجربة نموذج التأجير مع 3 مزارع', 'ملف التقديم لبرامج الدعم'] },
      { phase: 'النمو', duration: '10 أسابيع', items: ['توسيع التجارب الميدانية', 'لوحة بيانات للمزارع'] },
      { phase: 'التوسع', duration: '12 أسبوع', items: ['عقود سنوية', 'تصنيع محلي للحساسات'] },
    ],
    evaluatedAt: '2026-05-28', modelId: 'claude-sonnet-4-6',
  },
  {
    id: 'p6', code: 'INC-029', name: 'مساعد قانوني ذكي', sector: 'الخدمات القانونية',
    description: 'أداة تحليل عقود وصياغة مذكرات قانونية بالعربية لمكاتب المحاماة الصغيرة.',
    stage: 'منتج أولي (MVP)', teamSize: 3, fundingAsk: '500 ألف ريال', ownerId: 'u6', status: 'evaluated',
    totalScore: 68, decision: 'conditional', criteria: C(72, 66, 70, 62, 66),
    strengths: ['سوق متعطش للأتمتة', 'شريك مؤسس محامٍ ممارس'],
    weaknesses: ['مخاطر دقة المخرجات القانونية', 'لا توجد آلية مراجعة بشرية مدمجة'],
    recommendations: ['إضافة طبقة مراجعة بشرية إلزامية', 'البدء بحالات استخدام منخفضة المخاطر (تلخيص، فهرسة)'],
    plan: [
      { phase: 'التأسيس', duration: '4 أسابيع', items: ['تضييق النطاق لتلخيص العقود', 'بروتوكول مراجعة بشرية'] },
      { phase: 'النمو', duration: '8 أسابيع', items: ['تجربة مع 10 مكاتب محاماة', 'قياس دقة المخرجات'] },
      { phase: 'التوسع', duration: '12 أسبوع', items: ['توسيع حالات الاستخدام', 'تسعير اشتراكات'] },
    ],
    evaluatedAt: '2026-06-07', modelId: 'claude-sonnet-4-6',
  },
  {
    id: 'p7', code: 'INC-033', name: 'تحليل مشاعر العملاء', sector: 'التجارة',
    description: 'تحليل تقييمات ومحادثات العملاء بالعربية لاستخراج رؤى تشغيلية للمتاجر الإلكترونية.',
    stage: 'فكرة متقدمة', teamSize: 2, fundingAsk: '300 ألف ريال', status: 'evaluated',
    totalScore: 55, decision: 'develop', criteria: C(58, 60, 52, 48, 54),
    strengths: ['تكلفة تطوير منخفضة', 'سهولة التكامل مع منصات المتاجر'],
    weaknesses: ['ميزة تنافسية ضعيفة — متاح كخاصية في أدوات كبرى', 'فريق غير متفرغ'],
    recommendations: ['إعادة التموضع كأداة متخصصة بقطاع المطاعم', 'تفرّغ مؤسس واحد على الأقل'],
    plan: [
      { phase: 'التطوير', duration: '6 أسابيع', items: ['مقابلات مع 20 عميلاً محتملاً', 'إعادة تعريف الشريحة المستهدفة'] },
      { phase: 'التحقق', duration: '8 أسابيع', items: ['نموذج أولي مركّز', '5 عملاء تجريبيين'] },
      { phase: 'إعادة التقييم', duration: '4 أسابيع', items: ['التقدم بطلب احتضان جديد'] },
    ],
    evaluatedAt: '2026-05-20', modelId: 'claude-sonnet-4-6',
  },
  {
    id: 'p8', code: 'INC-035', name: 'توصيات سياحية ذكية', sector: 'السياحة',
    description: 'تطبيق يقترح مسارات سياحية مخصصة داخل المملكة بناءً على تفضيلات المستخدم.',
    stage: 'فكرة', teamSize: 2, fundingAsk: '400 ألف ريال', status: 'evaluated',
    totalScore: 41, decision: 'unsuitable', criteria: C(40, 45, 38, 42, 40),
    strengths: ['قطاع سياحي نامٍ'],
    weaknesses: ['لا يوجد تمايز تقني حقيقي', 'منافسة مباشرة من منصات مدعومة حكومياً', 'لا توجد خطة إيرادات'],
    recommendations: ['التقدم لبرامج ما قبل الاحتضان لتطوير الفكرة', 'دراسة الشراكة مع المنصات القائمة بدل منافستها'],
    plan: [
      { phase: 'التطوير', duration: '8 أسابيع', items: ['برنامج ما قبل الاحتضان', 'التحقق من المشكلة مع مستخدمين حقيقيين'] },
    ],
    evaluatedAt: '2026-05-15', modelId: 'claude-haiku-4-5',
  },
];

export const SECTORS = [...new Set(PROJECTS.map((p) => p.sector))];

export const scoreTone = (s: number) =>
  s >= 75 ? 'text-[#006633]' : s >= 60 ? 'text-emerald-600' : s >= 45 ? 'text-amber-600' : 'text-red-600';

export const DECISION_STYLE: Record<Decision, string> = {
  direct: 'bg-[#006633]/10 text-[#006633] border-[#006633]/30',
  conditional: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  develop: 'bg-amber-50 text-amber-700 border-amber-300',
  unsuitable: 'bg-red-50 text-red-700 border-red-300',
};
