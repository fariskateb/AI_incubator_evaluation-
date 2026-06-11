import { env } from '@/lib/env';

export interface SendResult {
  ok: boolean;
  providerId?: string;
  skipped?: boolean;
  error?: string;
}

const DEFAULT_FROM = 'حاضنة الذكاء الاصطناعي <reports@incubator.kau.edu.sa>';

// Sends an email via Resend's REST API (no SDK dependency). When RESEND_API_KEY
// is not configured, returns { ok:false, skipped:true } so callers can degrade
// gracefully instead of failing.
export async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  if (!env.RESEND_API_KEY) {
    return { ok: false, skipped: true, error: 'RESEND_API_KEY غير مُهيّأ' };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: env.RESEND_FROM ?? DEFAULT_FROM, to: [to], subject, html }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, error: body?.message ?? `HTTP ${res.status}` };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, providerId: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

const DECISION_LABEL: Record<string, string> = {
  direct: 'احتضان مباشر', conditional: 'احتضان مشروط', develop: 'يحتاج تطوير', unsuitable: 'غير مناسب',
};

export function buildReportHtml(p: {
  name: string;
  code: string;
  totalScore: number;
  decision: string;
  criteria: { label: string; score: number; weight: number }[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}): string {
  const li = (items: string[]) => items.map((i) => `<li>${escapeHtml(i)}</li>`).join('');
  const rows = p.criteria
    .map((c) => `<tr><td style="padding:4px 8px">${escapeHtml(c.label)} (${c.weight}%)</td><td style="padding:4px 8px;font-weight:700">${c.score}</td></tr>`)
    .join('');
  return `<!doctype html><html dir="rtl" lang="ar"><body style="font-family:system-ui,sans-serif;color:#1f2733;max-width:640px;margin:0 auto">
  <div style="background:linear-gradient(160deg,#004D26,#006633);color:#fff;padding:24px;border-radius:8px">
    <div style="font-weight:700">جامعة الملك عبدالعزيز — حاضنة الذكاء الاصطناعي</div>
    <h1 style="margin:8px 0 0">${escapeHtml(p.name)} <span style="font-size:14px;opacity:.8">(${escapeHtml(p.code)})</span></h1>
  </div>
  <div style="padding:16px 8px">
    <p style="font-size:32px;font-weight:800;margin:0;color:#006633">${p.totalScore} <span style="font-size:14px;color:#5b6573">/ 100 — ${DECISION_LABEL[p.decision] ?? p.decision}</span></p>
    <h3>درجات المعايير</h3>
    <table style="border-collapse:collapse;width:100%">${rows}</table>
    <h3 style="color:#15803d">نقاط القوة</h3><ul>${li(p.strengths)}</ul>
    <h3 style="color:#b45309">نقاط الضعف</h3><ul>${li(p.weaknesses)}</ul>
    <h3>التوصيات</h3><ul>${li(p.recommendations)}</ul>
    <p style="color:#5b6573;font-size:12px;border-top:1px solid #dce1e8;padding-top:12px;margin-top:20px">
      تقرير صادر عن حاضنة الذكاء الاصطناعي — جامعة الملك عبدالعزيز · kau.edu.sa
    </p>
  </div></body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
