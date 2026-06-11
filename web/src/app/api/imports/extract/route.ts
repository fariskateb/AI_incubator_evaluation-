import { requireRole, toErrorResponse } from '@/lib/rbac';
import { parseSheet, extractProjects } from '@/lib/ai/extract';

// POST /api/imports/extract — multipart upload of an xlsx/csv file.
// Parses it, runs Claude extraction, and returns candidate projects for review
// (nothing is persisted here). Admin/evaluator only.
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    await requireRole('admin', 'evaluator');
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return Response.json({ error: 'لم يُرفق ملف' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'حجم الملف يتجاوز 5 ميجابايت' }, { status: 413 });
    }
    const buffer = await file.arrayBuffer();
    const rows = parseSheet(buffer);
    if (rows.length === 0) {
      return Response.json({ error: 'الملف فارغ أو غير صالح' }, { status: 422 });
    }
    const projects = await extractProjects(rows.slice(0, 50));
    return Response.json({ projects, rowCount: rows.length });
  } catch (err) {
    return toErrorResponse(err);
  }
}
