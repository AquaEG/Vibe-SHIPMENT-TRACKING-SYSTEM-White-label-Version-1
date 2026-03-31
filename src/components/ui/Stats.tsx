import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './Card';

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-white">{value}</p>
          {hint ? <p className="mt-2 text-sm text-slate-400">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <Icon className="size-5 text-sky-300" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
