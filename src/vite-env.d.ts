/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_DEFAULT_WEBHOOK_URL?: string;
  readonly VITE_DEFAULT_PRODUCTION_WEBHOOK_URL?: string;
  readonly VITE_DEFAULT_REQUEST_METHOD?: string;
  readonly VITE_DEFAULT_AUTH_TYPE?: string;
  readonly VITE_DEFAULT_AUTH_TOKEN?: string;
  readonly VITE_DEFAULT_TRACKING_PARAM_NAME?: string;
  readonly VITE_DEFAULT_CONTENT_TYPE?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_DEFAULT_COMPANY_NAME?: string;
  readonly VITE_TRACKING_PROXY_URL?: string;
  readonly VITE_ALLOW_DIRECT_LIVE_INTEGRATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
