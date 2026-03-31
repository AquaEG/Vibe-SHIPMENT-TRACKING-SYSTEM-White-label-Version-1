export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  appName: import.meta.env.VITE_APP_NAME ?? 'TrackFlow',
  trackingProxyUrl: import.meta.env.VITE_TRACKING_PROXY_URL ?? '',
  allowDirectLiveIntegration: (import.meta.env.VITE_ALLOW_DIRECT_LIVE_INTEGRATION ?? 'false') === 'true',
  defaultProductionWebhookUrl: import.meta.env.VITE_DEFAULT_PRODUCTION_WEBHOOK_URL ?? '',
};

export function hasSupabaseConfig() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}
