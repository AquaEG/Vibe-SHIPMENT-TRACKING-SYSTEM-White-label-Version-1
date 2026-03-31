import { Badge } from '../ui/Badge';
import type { ShipmentStatus } from '../../lib/types';
import { cn } from '../../lib/utils';

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  Pending: 'border-slate-400/20 bg-slate-400/10 text-slate-200',
  'Shipment Created': 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100',
  'Picked Up': 'border-sky-400/20 bg-sky-400/10 text-sky-100',
  'In Transit': 'border-blue-400/20 bg-blue-400/10 text-blue-100',
  'Out for Delivery': 'border-amber-400/20 bg-amber-400/10 text-amber-100',
  Delivered: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
  'Failed Delivery': 'border-rose-400/20 bg-rose-400/10 text-rose-100',
  Returned: 'border-orange-400/20 bg-orange-400/10 text-orange-100',
  Delayed: 'border-violet-400/20 bg-violet-400/10 text-violet-100',
  Exception: 'border-red-400/20 bg-red-400/10 text-red-100',
};

export function StatusBadge({ status }: { status: ShipmentStatus | string }) {
  const key = (status in STATUS_STYLES ? status : 'Pending') as ShipmentStatus;
  return <Badge className={cn('border', STATUS_STYLES[key])}>{status}</Badge>;
}
