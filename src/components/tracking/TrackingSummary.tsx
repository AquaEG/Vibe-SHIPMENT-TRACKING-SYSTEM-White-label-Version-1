import { CalendarDays, MapPin, Package2, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { StatusBadge } from './StatusBadge';
import type { TrackingResult } from '../../lib/types';
import { formatDate, formatDateTime, formatRelativeTime } from '../../lib/utils';

export function TrackingSummary({ result }: { result: TrackingResult }) {
  const items = [
    { label: 'Tracking number', value: result.tracking_id, icon: Package2 },
    { label: 'Status', value: result.shipment_status, icon: Package2, badge: true },
    { label: 'Current location', value: result.current_location, icon: MapPin },
    { label: 'Estimated delivery', value: formatDate(result.estimated_delivery), icon: CalendarDays },
    { label: 'Sender', value: result.sender_name, icon: Users },
    { label: 'Recipient', value: result.recipient_name, icon: Users },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
              {item.badge ? (
                <div className="mt-3">
                  <StatusBadge status={result.shipment_status} />
                </div>
              ) : (
                <p className="mt-2 text-lg font-medium text-white">{item.value || '-'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      <Card className="lg:col-span-2">
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last update</p>
            <p className="mt-2 text-lg font-medium text-white">{formatDateTime(result.last_update)}</p>
            <p className="mt-1 text-sm text-slate-500">{formatRelativeTime(result.last_update)}</p>
          </div>
          <p className="text-sm text-slate-400">{result.shipping_type}</p>
        </CardContent>
      </Card>
    </div>
  );
}
