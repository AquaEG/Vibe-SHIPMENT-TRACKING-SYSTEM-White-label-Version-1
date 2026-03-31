import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-11 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3.5 text-sm text-slate-100 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
