import { CircleCheck, CircleX, PlugZap, RefreshCw, ShieldAlert, Truck } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Separator } from '../../components/ui/Separator';
import { StatCard } from '../../components/ui/Stats';
import { formatRelativeTime } from '../../lib/utils';

export function DashboardPage() {
  const { appSettings, trackingLogs, mockShipments, refreshAll, isLoading } = useAppData();

  const metrics = useMemo(() => {
    const successful = trackingLogs.filter((log) => log.is_success).length;
    const failed = trackingLogs.filter((log) => !log.is_success).length;
    return {
      total: trackingLogs.length,
      successful,
      failed,
      lastRequest: trackingLogs[0]?.created_at,
      recentErrors: trackingLogs.filter((log) => !log.is_success).slice(0, 4),
      recentRequests: trackingLogs.slice(0, 6),
    };
  }, [trackingLogs]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Overview</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">Operations snapshot</h2>
          <p className="mt-2 text-sm text-slate-400">
            A concise view of tracking volume, integration health, and current demo posture.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void refreshAll()} loading={isLoading}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard label="Tracking requests" value={String(metrics.total)} icon={Truck} />
        <StatCard label="Successful" value={String(metrics.successful)} icon={CircleCheck} />
        <StatCard label="Failed" value={String(metrics.failed)} icon={CircleX} />
        <StatCard
          label="Mode"
          value={
            appSettings.live_mode_enabled && !appSettings.mock_mode_enabled
              ? 'Live'
              : appSettings.mock_mode_enabled
                ? 'Mock'
                : 'Disabled'
          }
          hint={
            appSettings.live_mode_enabled && !appSettings.mock_mode_enabled
              ? 'Sending requests to live integration.'
              : appSettings.mock_mode_enabled
                ? 'Using safe demo shipment data.'
                : 'Tracking is currently disabled.'
          }
          icon={PlugZap}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent requests</CardTitle>
            <CardDescription>Latest attempts captured from the tracker.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {metrics.recentRequests.length ? (
              metrics.recentRequests.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-white">{log.tracking_number}</p>
                      <Badge className={log.is_success ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' : 'border-rose-400/20 bg-rose-400/10 text-rose-100'}>
                        {log.is_success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      {log.shipment_status || 'Unknown'} | {log.mode} | {formatRelativeTime(log.created_at)}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">{log.response_time_ms ? `${log.response_time_ms} ms` : '-'}</p>
                </div>
              ))
            ) : (
              <EmptyState
                title="No requests yet"
                description="Track a shipment to populate request logs and response metrics."
              />
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Current configuration snapshot.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-400">Integration</span>
                <span className="text-sm text-white">{appSettings.integration_name}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-400">Active mode</span>
                <Badge
                  className={
                    appSettings.live_mode_enabled && !appSettings.mock_mode_enabled
                      ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100'
                      : 'border-slate-400/20 bg-slate-400/10 text-slate-200'
                  }
                >
                  {appSettings.live_mode_enabled && !appSettings.mock_mode_enabled
                    ? 'Live'
                    : appSettings.mock_mode_enabled
                      ? 'Mock'
                      : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-400">Mock shipments</span>
                <span className="text-sm text-white">{mockShipments.length}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-400">Last request</span>
                <span className="text-sm text-white">{metrics.lastRequest ? formatRelativeTime(metrics.lastRequest) : '-'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent errors</CardTitle>
              <CardDescription>Most recent failed lookups or integration issues.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {metrics.recentErrors.length ? (
                metrics.recentErrors.map((log) => (
                  <div key={log.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-medium text-white">{log.tracking_number}</p>
                    <p className="mt-1 text-sm text-slate-400">{log.error_message || 'Unknown error'}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No errors captured recently.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-3">
                <ShieldAlert className="size-5 text-amber-300" />
                <div>
                  <p className="text-sm font-medium text-white">Integration reminder</p>
                  <p className="text-sm text-slate-400">
                    Keep live transport behind a proxy if your webhook requires credentials.
                  </p>
                </div>
              </div>
              <Separator />
              <Link to="/admin/integration" className="text-sm text-sky-300 transition hover:text-sky-200">
                Review integration settings
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
