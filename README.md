# TrackFlow

TrackFlow is a white-label shipment tracking SaaS demo built with React, Vite, TypeScript, Tailwind CSS, and Supabase.

## What is included

- Public shipment tracking portal
- Admin dashboard
- Integration settings
- Branding settings
- Request logs
- Mock shipment manager
- Supabase-ready schema and seed data
- LocalStorage fallback for offline/demo use

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in the values you need.

3. If you are using Supabase, run the SQL in `supabase/schema.sql` in the Supabase SQL editor.

4. Optional: run `supabase/seed.sql` to load demo shipments.

5. Start the app:

```bash
npm run dev
```

## Supabase notes

- The app uses `public_app_settings` and `public_branding_settings` for safe public reads.
- Admin pages read the full tables after authentication.
- `tracking_logs` accepts public inserts for demo tracking activity.
- `mock_shipments` is publicly readable so the public tracker can serve mock demos safely.
- If you do not provide Supabase env vars, the app falls back to a local in-browser demo database.
- If you do provide Supabase env vars, set up Supabase Auth for the admin pages.

## Live tracking architecture

TrackFlow supports two live integration paths:

- `VITE_TRACKING_PROXY_URL` for a secure serverless proxy
- direct webhook calls for demo-only setups when `VITE_ALLOW_DIRECT_LIVE_INTEGRATION=true`
- `VITE_DEFAULT_WEBHOOK_URL` can hold your current test webhook
- `VITE_DEFAULT_PRODUCTION_WEBHOOK_URL` can hold the production webhook without replacing the test field

For production use, keep secrets behind a proxy or serverless function.

## Environment variables

See `.env.example` for the full list of supported variables.

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - type-check and build
- `npm run preview` - preview the production build
- `npm run typecheck` - run TypeScript only
