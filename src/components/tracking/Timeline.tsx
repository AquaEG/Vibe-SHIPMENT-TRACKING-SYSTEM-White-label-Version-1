import { format } from 'date-fns';
import type { TimelineItem } from '../../lib/types';
import { StatusBadge } from './StatusBadge';

export function Timeline({ items }: { items: TimelineItem[] }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">No timeline events available.</p>;
  }

  return (
    <div className="relative flex flex-col gap-4">
      {items.map((item, index) => (
        <div key={`${item.status}-${item.timestamp}-${index}`} className="relative pl-10">
          <span className="absolute left-3 top-1.5 h-full w-px bg-white/10" aria-hidden="true" />
          <span className="absolute left-0 top-1.5 size-6 rounded-full border border-sky-400/25 bg-sky-400/10" />
          <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusBadge status={item.status} />
              <span className="text-xs text-slate-500">
                {format(new Date(item.timestamp), 'dd MMM yyyy, HH:mm')}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-white">{item.location}</p>
              {item.note ? <p className="text-sm text-slate-400">{item.note}</p> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
