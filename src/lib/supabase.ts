import { createClient } from '@supabase/supabase-js';
import { env, hasSupabaseConfig } from './env';
import type { AppSettings, BrandingSettings, MockShipment, TrackingLog } from './types';

export interface Database {
  public: {
    Tables: {
      app_settings: {
        Row: AppSettings;
        Insert: Partial<AppSettings>;
        Update: Partial<AppSettings>;
      };
      branding_settings: {
        Row: BrandingSettings;
        Insert: Partial<BrandingSettings>;
        Update: Partial<BrandingSettings>;
      };
      tracking_logs: {
        Row: TrackingLog;
        Insert: Partial<TrackingLog>;
        Update: Partial<TrackingLog>;
      };
      mock_shipments: {
        Row: MockShipment;
        Insert: Partial<MockShipment>;
        Update: Partial<MockShipment>;
      };
    };
    Views: {
      public_app_settings: {
        Row: Pick<
          AppSettings,
          | 'id'
          | 'integration_name'
          | 'webhook_url'
          | 'production_webhook_url'
          | 'webhook_mode'
          | 'request_method'
          | 'content_type'
          | 'tracking_param_name'
          | 'request_body_template'
          | 'timeout_ms'
          | 'live_mode_enabled'
          | 'mock_mode_enabled'
          | 'updated_at'
          | 'created_at'
        >;
      };
      public_branding_settings: {
        Row: BrandingSettings;
      };
    };
  };
}

export const supabase = hasSupabaseConfig()
  ? createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
