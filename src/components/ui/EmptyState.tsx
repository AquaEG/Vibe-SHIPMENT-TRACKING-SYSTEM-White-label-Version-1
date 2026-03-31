import type { ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <Card className="flex flex-col items-start gap-3 p-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
        {title}
      </div>
      <p className="max-w-xl text-sm text-slate-400">{description}</p>
      {action ? <Button onClick={action.onClick}>{action.label}</Button> : null}
    </Card>
  );
}
