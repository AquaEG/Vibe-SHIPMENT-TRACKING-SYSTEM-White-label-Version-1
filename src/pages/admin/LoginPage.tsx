import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Truck } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, authLoading, signIn, isSupabaseConnected } = useAppData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) return null;
  if (isAuthenticated) return <Navigate to="/admin" replace />;

  async function handleSubmit() {
    setBusy(true);
    setError(null);
    try {
      const result = await signIn(email, password);
      if (result.ok) {
        navigate('/admin');
      } else {
        setError(result.message ?? 'Sign in failed.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-trackflow-grid px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8">
            <div className="absolute inset-0 grid-overlay opacity-50" />
            <div className="relative">
              <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100">Admin access</Badge>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-white">
                Manage white-label tracking with a single control surface.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                Sign in with Supabase Auth, or use demo access in a local-only setup. The portal keeps branding,
                integration, logs, and mock shipments in sync.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Truck className="size-4 text-sky-300" />
                    Demo-ready tracker
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <LockKeyhole className="size-4 text-sky-300" />
                    {isSupabaseConnected ? 'Supabase connected' : 'Local demo mode'}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Card className="self-center">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <LockKeyhole className="size-5 text-sky-300" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-white">Admin login</h2>
                  <p className="text-sm text-slate-400">Connect settings, logs, and mock data.</p>
                </div>
              </div>

              <div className="mt-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="admin@company.com"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="password"
                    />
                    <FieldDescription>
                      If Supabase Auth is not configured, demo access opens the dashboard locally.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </div>

              {error ? (
                <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3">
                <Button onClick={() => void handleSubmit()} loading={busy}>
                  Sign in
                  <ArrowRight className="size-4" />
                </Button>
                {!isSupabaseConnected ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      void signIn('demo@trackflow.local', 'demo');
                      navigate('/admin');
                    }}
                  >
                    Enter demo dashboard
                  </Button>
                ) : (
                  <p className="text-sm text-slate-400">
                    Demo access is available when Supabase env vars are not configured.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
