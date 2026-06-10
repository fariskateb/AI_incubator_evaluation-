import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/lib/env';
import type { Project } from '@/db/schema';

// Default to the most capable model for evaluation quality.
const MODEL = 'claude-opus-4-8';

export type Decision = 'direct' | 'conditional' | 'develop' | 'unsuitable';

export interface EvaluationResult {
  criteria: { key: string; label: string; score: number; weight: number }[];
  totalScore: number;
  decision: Decision;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  plan: { phase: string; duration: string; items: string[] }[];
  kind: 'ai' | 'heuristic';
  modelId: string;
  rawResponse?: string;
  tokenUsage?: { input: number; output: number };
}

const CRITERIA: { key: string; label: string; weight: number }[] = [
  { key: 'innovation', label: 'الابتكار والتميّز', weight: 25 },
  { key: 'tech', label: 'الجدوى التقنية', weight: 25 },
  { key: 'market', label: 'حجم السوق والمنافسة', weight: 20 },
  { key: 'team', label: 'قدرات الفريق', weight: 15 },
  { key: 'finance', label: 'النموذج المالي', weight: 15 },
];

// Tool schema forces Claude to return exactly the structured shape we store.
const EVAL_TOOL: Anthropic.Tool = {
  name: 'submit_evaluation',
  description: 'تسجيل تقييم المشروع بدرجات المعايير والقرار وخطة العمل.',
  input_schema: {
    type: 'object',
    properties: {
      scores: {
        type: 'object',
        description: 'درجة كل معيار من 0 إلى 100',
        properties: {
          innovation: { type: 'integer' },
          tech: { type: 'integer' },
          market: { type: 'integer' },
          team: { type: 'integer' },
          finance: { type: 'integer' },
        },
        required: ['innovation', 'tech', 'market', 'team', 'finance'],
      },
      decision: {
        type: 'string',
        enum: ['direct', 'conditional', 'develop', 'unsuitable'],
        description: 'قرار الاحتضان',
      },
      strengths: { type: 'array', items: { type: 'string' }, description: '2-4 نقاط قوة' },
      weaknesses: { type: 'array', items: { type: 'string' }, description: '2-4 نقاط ضعف' },
      recommendations: { type: 'array', items: { type: 'string' }, description: '2-4 توصيات قابلة للتنفيذ' },
      plan: {
        type: 'array',
        description: 'خطة عمل من 2-3 مراحل',
        items: {
          type: 'object',
          properties: {
            phase: { type: 'string' },
            duration: { type: 'string' },
            items: { type: 'array', items: { type: 'string' } },
          },
          required: ['phase', 'duration', 'items'],
        },
      },
    },
    required: ['scores', 'decision', 'strengths', 'weaknesses', 'recommendations', 'plan'],
  },
};

function buildPrompt(p: Project): string {
  const lines = [
    `الاسم: ${p.name}`,
    `القطاع: ${p.sector}`,
    `المرحلة: ${p.stage ?? 'غير محددة'}`,
    `حجم الفريق: ${p.teamSize ?? 'غير محدد'}`,
    `طلب التمويل: ${p.fundingAsk ?? 'غير محدد'}`,
    `الوصف: ${p.description}`,
    p.targetAudience && `الفئة المستهدفة: ${p.targetAudience}`,
    p.marketSize && `حجم السوق: ${p.marketSize}`,
    p.competitors && `المنافسون: ${p.competitors}`,
    p.revenueModel && `نموذج الإيرادات: ${p.revenueModel}`,
    p.aiDescription && `استخدام الذكاء الاصطناعي: ${p.aiDescription}`,
  ].filter(Boolean);

  return `أنت مقيّم خبير في حاضنة الذكاء الاصطناعي بجامعة الملك عبدالعزيز. قيّم المشروع التالي بموضوعية وفق خمسة معايير (الابتكار 25%، الجدوى التقنية 25%، السوق 20%، الفريق 15%، النموذج المالي 15%)، ثم حدّد قرار الاحتضان وخطة عمل مرحلية. استخدم أداة submit_evaluation لتسجيل النتيجة.

بيانات المشروع:
${lines.join('\n')}`;
}

function weightedTotal(scores: Record<string, number>): number {
  return Math.round(CRITERIA.reduce((sum, c) => sum + (scores[c.key] ?? 0) * (c.weight / 100), 0));
}

// Deterministic local fallback when the API key is absent or the call fails.
export function heuristicEvaluate(p: Project): EvaluationResult {
  let h = 0;
  for (const ch of p.name + p.description) h = (h * 31 + ch.charCodeAt(0)) % 1000;
  const stageBoost = ['فكرة', 'فكرة متقدمة', 'نموذج تجريبي', 'منتج أولي (MVP)', 'إطلاق مبكر'].indexOf(p.stage ?? '') * 3;
  const base = 52 + (h % 20) + stageBoost + Math.min(p.teamSize ?? 3, 6);
  const clamp = (n: number) => Math.max(38, Math.min(92, Math.round(n)));
  const scores = {
    innovation: clamp(base + (h % 7)),
    tech: clamp(base - 4 + (h % 5)),
    market: clamp(base - 2 + (h % 9)),
    team: clamp(base - 6 + (h % 6)),
    finance: clamp(base - 5 + (h % 8)),
  };
  const total = weightedTotal(scores);
  const decision: Decision = total >= 75 ? 'direct' : total >= 60 ? 'conditional' : total >= 45 ? 'develop' : 'unsuitable';
  return {
    criteria: CRITERIA.map((c) => ({ ...c, score: scores[c.key as keyof typeof scores] })),
    totalScore: total,
    decision,
    strengths: ['فكرة واضحة قابلة للتطوير', 'توافق مع توجهات الحاضنة في الذكاء الاصطناعي'],
    weaknesses: ['يحتاج التحقق من السوق بمقابلات مع عملاء حقيقيين', 'النموذج المالي يحتاج تفصيلاً أدق'],
    recommendations: ['إجراء 15 مقابلة مع العملاء المستهدفين خلال الشهر الأول', 'بناء نموذج أولي مركّز على الميزة الأساسية'],
    plan: [
      { phase: 'التأسيس', duration: '4 أسابيع', items: ['التحقق من المشكلة مع المستخدمين', 'تحديد مؤشرات النجاح'] },
      { phase: 'النمو', duration: '8 أسابيع', items: ['بناء النموذج الأولي', 'تجربة مع مستخدمين تجريبيين'] },
      { phase: 'التوسع', duration: '12 أسبوع', items: ['قياس النتائج وإعادة التقييم', 'الاستعداد لجولة تمويل'] },
    ],
    kind: 'heuristic',
    modelId: 'heuristic-v1',
  };
}

export async function evaluateProject(p: Project): Promise<EvaluationResult> {
  if (!env.ANTHROPIC_API_KEY) return heuristicEvaluate(p);

  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      tools: [EVAL_TOOL],
      tool_choice: { type: 'tool', name: 'submit_evaluation' },
      messages: [{ role: 'user', content: buildPrompt(p) }],
    });

    const toolUse = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name === 'submit_evaluation',
    );
    if (!toolUse) throw new Error('No tool_use block in response');

    const out = toolUse.input as {
      scores: Record<string, number>;
      decision: Decision;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
      plan: { phase: string; duration: string; items: string[] }[];
    };

    return {
      criteria: CRITERIA.map((c) => ({ ...c, score: out.scores[c.key] ?? 0 })),
      totalScore: weightedTotal(out.scores),
      decision: out.decision,
      strengths: out.strengths,
      weaknesses: out.weaknesses,
      recommendations: out.recommendations,
      plan: out.plan,
      kind: 'ai',
      modelId: MODEL,
      rawResponse: JSON.stringify(out),
      tokenUsage: { input: response.usage.input_tokens, output: response.usage.output_tokens },
    };
  } catch (err) {
    console.error('AI evaluation failed, using heuristic fallback:', err);
    return heuristicEvaluate(p);
  }
}
