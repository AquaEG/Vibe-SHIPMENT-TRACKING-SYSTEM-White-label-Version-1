import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Separator } from '../../components/ui/Separator';
import { Skeleton } from '../../components/ui/Skeleton';
import { Timeline } from '../../components/tracking/Timeline';
import { TrackingSummary } from '../../components/tracking/TrackingSummary';
import { StatusBadge } from '../../components/tracking/StatusBadge';
import type { TrackingResult } from '../../lib/types';
import { withAlpha } from '../../lib/utils';

export function TrackingPage() {
  const { trackingNumber } = useParams();
  const { brandingSettings, isLoading, runTracking, appSettings } = useAppData();
  const [query, setQuery] = useState(trackingNumber ?? '');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = `${brandingSettings.company_name} | TrackFlow`;

    if (brandingSettings.favicon_url) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = brandingSettings.favicon_url;
    }
  }, [brandingSettings.company_name, brandingSettings.favicon_url]);

  useEffect(() => {
    if (trackingNumber) {
      setQuery(trackingNumber);
      void handleTrack(trackingNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingNumber]);

  async function handleTrack(value = query) {
    const cleaned = value.trim();
    if (!cleaned) {
      setError('Enter a tracking number to continue.');
      setResult(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await runTracking(cleaned);
      if (response.success) {
        setResult(response);
      } else {
        setResult(null);
        setError(response.error);
      }
    } catch (trackError) {
      setResult(null);
      setError(trackError instanceof Error ? trackError.message : 'Tracking request failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const heroSubtitle = useMemo(
    () => {
      if (appSettings.live_mode_enabled && !appSettings.mock_mode_enabled) {
        return 'Live integration enabled';
      }
      if (appSettings.mock_mode_enabled) {
        return 'Demo-safe mock mode enabled';
      }
      return 'Tracking disabled';
    },
    [appSettings.live_mode_enabled, appSettings.mock_mode_enabled]
  );

  return (
    <div className="min-h-screen bg-trackflow-grid text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="hero-orb absolute left-[-8rem] top-[-7rem] h-64 w-64 rounded-full bg-cyan-500/25" />
        <div className="hero-orb absolute right-[-6rem] top-[10%] h-64 w-64 rounded-full bg-sky-500/15" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-[1540px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-3">
            {brandingSettings.logo_url ? (
              <img
                src={brandingSettings.logo_url}
                alt={brandingSettings.company_name}
                className="size-12 rounded-2xl object-cover ring-1 ring-white/10"
              />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 font-display text-lg font-semibold">
                T
              </div>
            )}
            <div>
              <p className="font-display text-lg font-semibold text-white">{brandingSettings.company_name}</p>
              <p className="text-xs text-slate-400">{brandingSettings.footer_text}</p>
            </div>
          </div>
          <Badge
            className="text-white"
            style={{
              borderColor: withAlpha(brandingSettings.primary_color, 0.28),
              backgroundColor: withAlpha(brandingSettings.primary_color, 0.12),
              color: brandingSettings.primary_color,
            }}
          >
            {heroSubtitle}
          </Badge>
        </header>

        <main className="flex flex-1 flex-col gap-6 pt-4 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow sm:p-8 lg:min-h-[780px]">
            <div className="absolute inset-0 grid-overlay opacity-60" />
            <div className="relative flex h-full flex-col gap-8">
              <div className="max-w-2xl">
                <Badge className="border-white/10 bg-white/5 text-slate-200">White-label tracking portal</Badge>
                <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  {brandingSettings.tracking_page_title}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                  Customers can enter a tracking number and get a polished shipment status view with timeline,
                  delivery estimate, and last-mile progress.
                </p>
              </div>

              <Card className="relative max-w-2xl">
                <CardContent className="space-y-4 p-5 sm:p-6">
                  <form
                    className="flex flex-col gap-3 sm:flex-row"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleTrack();
                    }}
                  >
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Enter tracking number, e.g. TRK-102938"
                      aria-label="Tracking number"
                    />
                    <Button
                      type="submit"
                      loading={submitting}
                      style={{
                        backgroundColor: brandingSettings.primary_color,
                        color: '#020617',
                      }}
                    >
                      Track shipment
                      <ArrowRight className="size-4" />
                    </Button>
                  </form>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <Badge className="border-white/10 bg-white/5">Enter key supported</Badge>
                    <Badge className="border-white/10 bg-white/5">
                      {appSettings.live_mode_enabled && !appSettings.mock_mode_enabled
                        ? 'Live mode active'
                        : appSettings.live_mode_enabled
                          ? 'Live mode available'
                          : 'Live mode disabled'}
                    </Badge>
                    <Badge className="border-white/10 bg-white/5">
                      {appSettings.mock_mode_enabled ? 'Mock mode ready' : 'Mock mode off'}
                    </Badge>
                  </div>
                  {error ? (
                    <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                      {error}
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  'Premium white-label experience',
                  'Timeline-driven delivery status',
                  'Mock/live integration abstraction',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            {isLoading ? (
              <Card>
                <CardContent className="flex flex-col gap-4 p-5">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-56 w-full" />
                </CardContent>
              </Card>
            ) : result ? (
              <div className="flex flex-col gap-4">
                <Card>
                  <CardContent className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current status</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{result.shipment_status}</p>
                    </div>
                    <StatusBadge status={result.shipment_status} />
                  </CardContent>
                </Card>
                <TrackingSummary result={result} />
                <Card>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Shipment timeline</p>
                      <p className="mt-2 text-sm text-slate-400">A readable delivery trail that is easy to present.</p>
                    </div>
                    <Separator />
                    <Timeline items={result.timeline} />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <EmptyState
                title="Track a shipment"
                description="Enter a tracking number to view the shipment's latest status, journey history, and delivery estimate."
                action={{ label: 'Load demo shipment', onClick: () => void handleTrack('TRK-102938') }}
              />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
