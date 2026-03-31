import { NavLink, Outlet } from 'react-router-dom';
import { Activity, Boxes, Building2, Layers3, LogOut, ShieldCheck, Truck } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { cn, withAlpha } from '../../lib/utils';

const navigation = [
  { to: '/admin', label: 'Overview', icon: Activity, end: true },
  { to: '/admin/integration', label: 'Integration', icon: ShieldCheck },
  { to: '/admin/branding', label: 'Branding', icon: Building2 },
  { to: '/admin/logs', label: 'Request Logs', icon: Layers3 },
  { to: '/admin/mock-shipments', label: 'Mock Shipments', icon: Boxes },
];

export function AppShell() {
  const { brandingSettings, signOut } = useAppData();

  return (
    <div className="min-h-screen bg-trackflow-grid text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="hero-orb absolute left-[-10rem] top-[-8rem] h-72 w-72 rounded-full bg-cyan-500/30" />
        <div className="hero-orb absolute right-[-7rem] top-[18%] h-64 w-64 rounded-full bg-sky-500/20" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-[1680px]">
        <aside className="glass hidden w-[300px] flex-col border-r border-white/5 px-5 py-6 lg:flex">
          <div className="flex items-center gap-3">
            <div
              className="flex size-12 items-center justify-center rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${withAlpha(brandingSettings.primary_color, 0.18)}, rgba(15,23,42,0.85))`,
                border: `1px solid ${withAlpha(brandingSettings.primary_color, 0.25)}`,
              }}
            >
              <Truck className="size-6" style={{ color: brandingSettings.primary_color }} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">{brandingSettings.company_name}</p>
              <p className="text-xs text-slate-400">White-label shipment tracking</p>
            </div>
          </div>

          <nav className="mt-10 flex flex-1 flex-col gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition',
                      'hover:bg-white/5 hover:text-white',
                      isActive && 'bg-sky-500/10 text-white ring-1 ring-sky-400/20'
                    )
                  }
                >
                  <Icon className="size-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin session</p>
            <p className="mt-2 text-sm text-slate-200">Manage settings, logs, and mock shipments.</p>
            <button
              type="button"
              onClick={() => void signOut()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/5"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex min-h-screen flex-1 flex-col">
          <header className="glass border-b border-white/5 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">TrackFlow admin</p>
                <h1 className="mt-1 font-display text-xl font-semibold text-white">Operations console</h1>
              </div>
              <div className="hidden items-center gap-3 md:flex">
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  Demo ready
                </div>
                <NavLink
                  to="/"
                  className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/5"
                >
                  Public portal
                </NavLink>
              </div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs transition',
                        isActive
                          ? 'border-sky-400/30 bg-sky-400/10 text-white'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      )
                    }
                  >
                    <Icon className="size-3.5" />
                    {item.label}
                  </NavLink>
                );
              })}
              <NavLink
                to="/"
                className="inline-flex shrink-0 items-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10"
              >
                Public portal
              </NavLink>
              <button
                type="button"
                onClick={() => void signOut()}
                className="inline-flex shrink-0 items-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10"
              >
                Sign out
              </button>
            </div>
          </header>

          <div className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
