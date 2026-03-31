create extension if not exists pgcrypto;

create table if not exists public.app_settings (
  id bigint primary key default 1,
  integration_name text not null default 'TrackFlow n8n',
  webhook_url text not null default '',
  production_webhook_url text not null default '',
  webhook_mode text not null default 'test' check (webhook_mode in ('test', 'production')),
  request_method text not null default 'POST' check (request_method in ('GET', 'POST')),
  auth_type text not null default 'none' check (auth_type in ('none', 'bearer', 'api_key', 'custom_header')),
  auth_token text not null default '',
  auth_header_name text not null default 'X-API-Key',
  custom_headers_json jsonb not null default '{}'::jsonb,
  content_type text not null default 'application/json',
  timeout_ms integer not null default 10000 check (timeout_ms between 1000 and 120000),
  tracking_param_name text not null default 'trackingNumber',
  request_body_template text not null default '{"trackingNumber":"{{trackingNumber}}"}',
  live_mode_enabled boolean not null default false,
  mock_mode_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branding_settings (
  id bigint primary key default 1,
  company_name text not null default 'TrackFlow Logistics',
  logo_url text not null default '',
  primary_color text not null default '#38bdf8',
  secondary_color text not null default '#0f172a',
  support_email text not null default 'support@trackflow.app',
  tracking_page_title text not null default 'Track a shipment in real time',
  footer_text text not null default 'White-label tracking portal powered by TrackFlow.',
  favicon_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tracking_logs (
  id uuid primary key default gen_random_uuid(),
  tracking_number text not null,
  mode text not null check (mode in ('mock', 'live')),
  is_success boolean not null default false,
  shipment_status text not null default 'Exception',
  current_location text not null default '',
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  error_message text not null default '',
  response_time_ms integer,
  created_at timestamptz not null default now()
);

create table if not exists public.mock_shipments (
  id uuid primary key default gen_random_uuid(),
  tracking_number text not null unique,
  shipment_status text not null default 'Pending',
  current_location text not null default '',
  estimated_delivery date not null,
  sender_name text not null default '',
  recipient_name text not null default '',
  shipping_type text not null default 'Standard',
  last_update timestamptz not null default now(),
  timeline_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

drop trigger if exists branding_settings_set_updated_at on public.branding_settings;
create trigger branding_settings_set_updated_at
before update on public.branding_settings
for each row execute function public.set_updated_at();

drop trigger if exists mock_shipments_set_updated_at on public.mock_shipments;
create trigger mock_shipments_set_updated_at
before update on public.mock_shipments
for each row execute function public.set_updated_at();

alter table public.app_settings enable row level security;
alter table public.branding_settings enable row level security;
alter table public.tracking_logs enable row level security;
alter table public.mock_shipments enable row level security;

grant select, insert, update, delete on public.app_settings to authenticated;
grant select, insert, update, delete on public.branding_settings to authenticated;
grant select on public.branding_settings to anon;
grant select, insert on public.tracking_logs to anon, authenticated;
grant select, insert, update, delete on public.mock_shipments to authenticated;
grant select on public.mock_shipments to anon;

drop policy if exists "public read branding" on public.branding_settings;
create policy "public read branding"
  on public.branding_settings
  for select
  using (true);

drop policy if exists "authenticated manage app settings" on public.app_settings;
create policy "authenticated manage app settings"
  on public.app_settings
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated read app settings" on public.app_settings;
create policy "authenticated read app settings"
  on public.app_settings
  for select
  to authenticated
  using (true);

drop policy if exists "authenticated manage branding" on public.branding_settings;
create policy "authenticated manage branding"
  on public.branding_settings
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "public insert tracking logs" on public.tracking_logs;
create policy "public insert tracking logs"
  on public.tracking_logs
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "authenticated read tracking logs" on public.tracking_logs;
create policy "authenticated read tracking logs"
  on public.tracking_logs
  for select
  to authenticated
  using (true);

drop policy if exists "public read mock shipments" on public.mock_shipments;
create policy "public read mock shipments"
  on public.mock_shipments
  for select
  using (true);

drop policy if exists "authenticated manage mock shipments" on public.mock_shipments;
create policy "authenticated manage mock shipments"
  on public.mock_shipments
  for all
  to authenticated
  using (true)
  with check (true);

drop view if exists public.public_app_settings;
create view public.public_app_settings as
select
  id,
  integration_name,
  webhook_url,
  production_webhook_url,
  webhook_mode,
  request_method,
  content_type,
  tracking_param_name,
  request_body_template,
  timeout_ms,
  live_mode_enabled,
  mock_mode_enabled,
  created_at,
  updated_at
from public.app_settings;

drop view if exists public.public_branding_settings;
create view public.public_branding_settings as
select
  id,
  company_name,
  logo_url,
  primary_color,
  secondary_color,
  support_email,
  tracking_page_title,
  footer_text,
  favicon_url,
  created_at,
  updated_at
from public.branding_settings;

grant select on public.public_app_settings to anon, authenticated;
grant select on public.public_branding_settings to anon, authenticated;

insert into public.app_settings (id, integration_name, webhook_url, production_webhook_url, webhook_mode, request_method, auth_type, auth_token, auth_header_name, custom_headers_json, content_type, timeout_ms, tracking_param_name, request_body_template, live_mode_enabled, mock_mode_enabled)
values (
  1,
  'TrackFlow n8n',
  '',
  '',
  'test',
  'POST',
  'none',
  '',
  'X-API-Key',
  '{}'::jsonb,
  'application/json',
  10000,
  'trackingNumber',
  '{"trackingNumber":"{{trackingNumber}}"}',
  false,
  true
)
on conflict (id) do update set
  integration_name = excluded.integration_name,
  webhook_url = excluded.webhook_url,
  production_webhook_url = excluded.production_webhook_url,
  webhook_mode = excluded.webhook_mode,
  request_method = excluded.request_method,
  auth_type = excluded.auth_type,
  auth_token = excluded.auth_token,
  auth_header_name = excluded.auth_header_name,
  custom_headers_json = excluded.custom_headers_json,
  content_type = excluded.content_type,
  timeout_ms = excluded.timeout_ms,
  tracking_param_name = excluded.tracking_param_name,
  request_body_template = excluded.request_body_template,
  live_mode_enabled = excluded.live_mode_enabled,
  mock_mode_enabled = excluded.mock_mode_enabled;

insert into public.branding_settings (id, company_name, logo_url, primary_color, secondary_color, support_email, tracking_page_title, footer_text, favicon_url)
values (
  1,
  'TrackFlow Logistics',
  '',
  '#38bdf8',
  '#0f172a',
  'support@trackflow.app',
  'Track a shipment in real time',
  'White-label tracking portal powered by TrackFlow.',
  ''
)
on conflict (id) do update set
  company_name = excluded.company_name,
  logo_url = excluded.logo_url,
  primary_color = excluded.primary_color,
  secondary_color = excluded.secondary_color,
  support_email = excluded.support_email,
  tracking_page_title = excluded.tracking_page_title,
  footer_text = excluded.footer_text,
  favicon_url = excluded.favicon_url;
