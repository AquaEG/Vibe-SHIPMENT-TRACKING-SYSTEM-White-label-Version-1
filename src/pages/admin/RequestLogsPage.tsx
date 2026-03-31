import { useMemo, useState } from 'react';
import { Search, ClipboardList } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { formatDate, formatRelativeTime } from '../../lib/utils';
import { Separator } from '../../components/ui/Separator';

export function RequestLogsPage() {
  const { trackingLogs } = useAppData();
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | 'mock' | 'live'>('all');
  const [resultFilter, setResultFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [selected, setSelected] = useState<(typeof trackingLogs)[number] | null>(null);

  const filtered = useMemo(() => {
    return trackingLogs.filter((log) => {
      const matchesSearch =
        !search ||
        log.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
        (log.error_message || '').toLowerCase().includes(search.toLowerCase());
      const matchesMode = modeFilter === 'all' || log.mode === modeFilter;
      const matchesResult =
        resultFilter === 'all' || (resultFilter === 'success' ? log.is_success : !log.is_success);
      return matchesSearch && matchesMode && matchesResult;
    });
  }, [trackingLogs, search, modeFilter, resultFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Logs</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">Request history</h2>
          <p className="mt-2 text-sm text-slate-400">Search and inspect tracking attempts, including raw payloads.</p>
        </div>
        <Badge className="border-white/10 bg-white/5 text-slate-200">
          {filtered.length} of {trackingLogs.length}
        </Badge>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <Input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by tracking number or error" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={modeFilter} onChange={(event) => setModeFilter(event.target.value as typeof modeFilter)}>
              <option value="all">All modes</option>
              <option value="mock">Mock</option>
              <option value="live">Live</option>
            </Select>
            <Select value={resultFilter} onChange={(event) => setResultFilter(event.target.value as typeof resultFilter)}>
              <option value="all">All results</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracking logs</CardTitle>
          <CardDescription>Click a row to inspect the request and response payloads.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                <th className="px-3 py-2">Timestamp</th>
                <th className="px-3 py-2">Tracking number</th>
                <th className="px-3 py-2">Mode</th>
                <th className="px-3 py-2">Result</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Response time</th>
                <th className="px-3 py-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelected(log)}
                  className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10"
                >
                  <td className="px-3 py-4 text-sm text-slate-300">{formatDate(log.created_at)}</td>
                  <td className="px-3 py-4 text-sm font-medium text-white">{log.tracking_number}</td>
                  <td className="px-3 py-4">
                    <Badge className="border-white/10 bg-white/5 text-slate-200">{log.mode}</Badge>
                  </td>
                  <td className="px-3 py-4">
                    <Badge
                      className={log.is_success ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' : 'border-rose-400/20 bg-rose-400/10 text-rose-100'}
                    >
                      {log.is_success ? 'Success' : 'Failed'}
                    </Badge>
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-300">{log.shipment_status || '-'}</td>
                  <td className="px-3 py-4 text-sm text-slate-300">{log.response_time_ms ? `${log.response_time_ms} ms` : '-'}</td>
                  <td className="px-3 py-4 text-sm text-slate-400">{log.error_message || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length ? (
            <div className="py-10">
              <div className="mx-auto max-w-lg text-center">
                <ClipboardList className="mx-auto size-8 text-slate-500" />
                <p className="mt-4 text-sm text-slate-400">No logs match your filters.</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Modal open={Boolean(selected)} title="Log details" onClose={() => setSelected(null)} className="max-w-5xl">
        {selected ? (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tracking number</p>
                  <p className="mt-2 text-sm font-medium text-white">{selected.tracking_number}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Source mode</p>
                  <p className="mt-2 text-sm font-medium text-white">{selected.mode}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Latency</p>
                  <p className="mt-2 text-sm font-medium text-white">{selected.response_time_ms ? `${selected.response_time_ms} ms` : '-'}</p>
                </CardContent>
              </Card>
            </div>
            <Separator />
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Request payload</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="overflow-x-auto rounded-2xl bg-slate-950/60 p-4 text-xs text-slate-200">
                    {JSON.stringify(selected.request_payload, null, 2)}
                  </pre>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Response payload</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="overflow-x-auto rounded-2xl bg-slate-950/60 p-4 text-xs text-slate-200">
                    {JSON.stringify(selected.response_payload, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
            {selected.error_message ? (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Error message</p>
                  <p className="mt-2 text-sm text-rose-100">{selected.error_message}</p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
