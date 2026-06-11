import Anthropic from '@anthropic-ai/sdk';
import * as XLSX from 'xlsx';
import { env } from '@/lib/env';

// Cheap, fast model for structured row extraction.
const MODEL = 'claude-haiku-4-5';

export interface ExtractedProject {
  name: string;
  sector: string;
  description: string;
  stage?: string;
  teamSize?: number;
  fundingAsk?: string;
}

const EXTRACT_TOOL: Anthropic.Tool = {
  name: 'submit_projects',
  description: 'تسجيل قائمة المشاريع المستخرجة من الملف.',
  input_schema: {
    type: 'object',
    properties: {
      projects: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'اسم المشروع' },
            sector: { type: 'string', description: 'القطاع' },
            description: { type: 'string', description: 'وصف المشروع والمشكلة (20 حرفاً على الأقل)' },
            stage: { type: 'string', description: 'مرحلة المشروع إن وُجدت' },
            teamSize: { type: 'integer', description: 'حجم الفريق إن وُجد' },
            fundingAsk: { type: 'string', description: 'طلب التمويل إن وُجد' },
          },
          required: ['name', 'sector', 'description'],
        },
      },
    },
    required: ['projects'],
  },
};

/** Parse an xlsx/csv buffer into raw row objects. */
export function parseSheet(buffer: ArrayBuffer): Record<string, unknown>[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

/** Heuristic fallback: best-effort field mapping by common column names. */
function fallbackExtract(rows: Record<string, unknown>[]): ExtractedProject[] {
  const pick = (r: Record<string, unknown>, keys: string[]) => {
    for (const k of Object.keys(r)) {
      if (keys.some((want) => k.toLowerCase().includes(want))) {
        const v = String(r[k] ?? '').trim();
        if (v) return v;
      }
    }
    return '';
  };
  return rows
    .map((r) => ({
      name: pick(r, ['name', 'اسم', 'مشروع']) || 'مشروع بدون اسم',
      sector: pick(r, ['sector', 'قطاع', 'مجال']) || 'أخرى',
      description: pick(r, ['desc', 'وصف', 'فكرة', 'مشكلة']) || 'لا يوجد وصف مفصّل في الملف.',
      stage: pick(r, ['stage', 'مرحلة']) || undefined,
      fundingAsk: pick(r, ['fund', 'تمويل', 'مبلغ']) || undefined,
    }))
    .filter((p) => p.name);
}

export async function extractProjects(rows: Record<string, unknown>[]): Promise<ExtractedProject[]> {
  if (rows.length === 0) return [];
  if (!env.ANTHROPIC_API_KEY) return fallbackExtract(rows);

  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: 'tool', name: 'submit_projects' },
      messages: [
        {
          role: 'user',
          content: `استخرج بيانات المشاريع من صفوف ملف Excel التالية. كل صف مشروع. طابق الأعمدة العربية أو الإنجليزية على الحقول المطلوبة، واكتب وصفاً موجزاً إذا كان الوصف ناقصاً. استخدم أداة submit_projects.\n\n${JSON.stringify(rows, null, 2)}`,
        },
      ],
    });

    const toolUse = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name === 'submit_projects',
    );
    if (!toolUse) throw new Error('No tool_use block');
    const out = toolUse.input as { projects: ExtractedProject[] };
    return out.projects.filter((p) => p.name && p.sector && p.description);
  } catch (err) {
    console.error('AI extraction failed, using fallback:', err);
    return fallbackExtract(rows);
  }
}
