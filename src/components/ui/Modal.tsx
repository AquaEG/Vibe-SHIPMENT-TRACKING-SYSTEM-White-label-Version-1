import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Modal({
  open,
  title,
  onClose,
  children,
  className,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn('glass max-h-[92vh] w-full overflow-hidden rounded-[28px] border border-white/10', className)}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="trackflow-scrollbar max-h-[calc(92vh-64px)] overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
