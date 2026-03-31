import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-trackflow-grid px-4 text-slate-100">
      <Card className="max-w-xl">
        <CardContent className="p-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">404</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-white">Page not found</h1>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            The route you opened does not exist in this TrackFlow demo.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-sky-300"
            >
              <ArrowLeft className="size-4" />
              Go to tracking page
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
