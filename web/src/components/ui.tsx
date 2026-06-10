import { forwardRef } from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', className = '', ...props },
  ref,
) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold h-9 px-4 transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1';
  const variants = {
    primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]',
    outline: 'border border-[var(--border)] bg-card hover:bg-[var(--muted)]',
    ghost: 'hover:bg-[var(--muted)] text-[var(--muted-foreground)]',
    danger: 'text-red-600 hover:bg-red-50',
  };
  return <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props} />;
});

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`h-9 w-full rounded-md border border-[var(--border)] bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${className}`}
        {...props}
      />
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = '', ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={`w-full rounded-md border border-[var(--border)] bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${className}`}
        {...props}
      />
    );
  },
);

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-semibold text-[var(--muted-foreground)]">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  );
}

export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-xl border border-[var(--border)] bg-card ${className}`}>{children}</div>;
}

const DECISION_LABEL: Record<string, string> = {
  direct: 'احتضان مباشر', conditional: 'احتضان مشروط', develop: 'يحتاج تطوير', unsuitable: 'غير مناسب',
};
const DECISION_STYLE: Record<string, string> = {
  direct: 'bg-[#006633]/10 text-[#006633] border-[#006633]/30',
  conditional: 'bg-amber-50 text-amber-700 border-amber-300',
  develop: 'bg-slate-100 text-slate-700 border-slate-300',
  unsuitable: 'bg-red-50 text-red-700 border-red-300',
};

export function DecisionBadge({ decision }: { decision: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${DECISION_STYLE[decision] ?? ''}`}>
      {DECISION_LABEL[decision] ?? decision}
    </span>
  );
}

export const ROLE_LABEL: Record<string, string> = {
  admin: 'مشرف', evaluator: 'مقيّم', investor: 'مستثمر', student: 'طالب',
};

export function scoreTone(s: number) {
  return s >= 75 ? 'text-[#006633]' : s >= 60 ? 'text-emerald-600' : s >= 45 ? 'text-amber-600' : 'text-red-600';
}
