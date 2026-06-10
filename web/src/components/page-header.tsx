export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--border)] bg-card px-6 py-4 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-lg font-bold">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--muted-foreground)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
