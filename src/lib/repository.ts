import { DEFAULT_APP_SETTINGS, DEFAULT_BRANDING_SETTINGS, DEFAULT_DEMO_MOCKS } from './constants';
import { env } from './env';
import { supabase } from './supabase';
import { readLocalDatabase, updateLocalDatabase } from './local-storage';
import { safeJsonParse } from './utils';
import type { AppSettings, BrandingSettings, MockShipment, TrackingLog } from './types';

const USE_SUPABASE = Boolean(supabase);

function hydrateAppSettings(settings: Partial<AppSettings> | null | undefined): AppSettings {
  const merged: AppSettings = {
    ...DEFAULT_APP_SETTINGS,
    ...settings,
    custom_headers_json:
      typeof settings?.custom_headers_json === 'string'
        ? safeJsonParse<Record<string, string>>(settings.custom_headers_json, {})
        : settings?.custom_headers_json ?? {},
    webhook_url: settings?.webhook_url ?? env.trackingProxyUrl ?? DEFAULT_APP_SETTINGS.webhook_url,
    production_webhook_url:
      settings?.production_webhook_url ?? env.trackingProxyUrl ?? DEFAULT_APP_SETTINGS.production_webhook_url,
    request_method: (settings?.request_method ?? DEFAULT_APP_SETTINGS.request_method).toUpperCase() as 'GET' | 'POST',
    auth_type: (settings?.auth_type ?? DEFAULT_APP_SETTINGS.auth_type) as AppSettings['auth_type'],
    timeout_ms: Number(settings?.timeout_ms ?? DEFAULT_APP_SETTINGS.timeout_ms),
  };
  return merged;
}

function hydrateBranding(settings: Partial<BrandingSettings> | null | undefined): BrandingSettings {
  return {
    ...DEFAULT_BRANDING_SETTINGS,
    ...settings,
  };
}

export async function getAppSettings() {
  if (USE_SUPABASE) {
    const client = supabase;
    if (!client) return readLocalDatabase().appSettings;
    const { data, error } = await client.from('app_settings' as any).select('*').eq('id', 1).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return hydrateAppSettings(data ?? DEFAULT_APP_SETTINGS);
  }
  return readLocalDatabase().appSettings;
}

export async function getPublicAppSettings() {
  if (USE_SUPABASE) {
    const client = supabase;
    if (!client) return readLocalDatabase().appSettings;
    const { data, error } = await client.from('public_app_settings' as any).select('*').eq('id', 1).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return hydrateAppSettings(data ?? DEFAULT_APP_SETTINGS);
  }
  return readLocalDatabase().appSettings;
}

export async function saveAppSettings(settings: AppSettings) {
  const next = {
    ...settings,
    updated_at: new Date().toISOString(),
  };

  if (USE_SUPABASE) {
    const client = supabase;
    if (!client) {
      updateLocalDatabase((db) => ({ ...db, appSettings: next }));
      return next;
    }
    const { data, error } = await (client.from('app_settings' as any) as any).upsert(next, { onConflict: 'id' }).select('*').single();
    if (error) throw error;
    return hydrateAppSettings(data);
  }

  updateLocalDatabase((db) => ({ ...db, appSettings: next }));
  return next;
}

export async function getBrandingSettings() {
  if (USE_SUPABASE) {
    const client = supabase;
    if (!client) return readLocalDatabase().brandingSettings;
    const { data, error } = await client.from('branding_settings' as any).select('*').eq('id', 1).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return hydrateBranding(data ?? DEFAULT_BRANDING_SETTINGS);
  }
  return readLocalDatabase().brandingSettings;
}

export async function getPublicBrandingSettings() {
  if (USE_SUPABASE) {
    const client = supabase;
    if (!client) return readLocalDatabase().brandingSettings;
    const { data, error } = await client.from('public_branding_settings' as any).select('*').eq('id', 1).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return hydrateBranding(data ?? DEFAULT_BRANDING_SETTINGS);
  }
  return readLocalDatabase().brandingSettings;
}

export async function saveBrandingSettings(settings: BrandingSettings) {
  const next = {
    ...settings,
    updated_at: new Date().toISOString(),
  };

  if (USE_SUPABASE) {
    const client = supabase;
    if (!client) {
      updateLocalDatabase((db) => ({ ...db, brandingSettings: next }));
      return next;
    }
    const { data, error } = await (client.from('branding_settings' as any) as any)
      .upsert(next, { onConflict: 'id' })
      .select('*')
      .single();
    if (error) throw error;
    return hydrateBranding(data);
  }

  updateLocalDatabase((db) => ({ ...db, brandingSettings: next }));
  return next;
}

export async function listTrackingLogs() {
  if (USE_SUPABASE) {
    const client = supabase;
    if (!client) return readLocalDatabase().trackingLogs;
    const { data, error } = await client.from('tracking_logs' as any).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  return readLocalDatabase().trackingLogs;
}

export async function appendTrackingLog(log: TrackingLog) {
  if (USE_SUPABASE) {
    const client = supabase;
    if (!client) {
      updateLocalDatabase((db) => ({ ...db, trackingLogs: [log, ...db.trackingLogs] }));
      return log;
    }
    const { data, error } = await (client.from('tracking_logs' as any) as any).insert(log).select('*').single();
    if (error) throw error;
    return data;
  }

  updateLocalDatabase((db) => ({ ...db, trackingLogs: [log, ...db.trackingLogs] }));
  return log;
}

export async function listMockShipments() {
  if (USE_SUPABASE) {
    const client = supabase;
    if (!client) return readLocalDatabase().mockShipments;
    const { data, error } = await client.from('mock_shipments' as any).select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  return readLocalDatabase().mockShipments;
}

export async function saveMockShipment(shipment: MockShipment) {
  const next = { ...shipment, updated_at: new Date().toISOString() };

  if (USE_SUPABASE) {
    const client = supabase;
    if (!client) {
      updateLocalDatabase((db) => {
        const existing = db.mockShipments.filter((item) => item.id !== shipment.id);
        return { ...db, mockShipments: [next, ...existing] };
      });
      return next;
    }
    const { data, error } = await (client.from('mock_shipments' as any) as any).upsert(next).select('*').single();
    if (error) throw error;
    return data;
  }

  updateLocalDatabase((db) => {
    const existing = db.mockShipments.filter((item) => item.id !== shipment.id);
    return { ...db, mockShipments: [next, ...existing] };
  });

  return next;
}

export async function deleteMockShipment(id: string) {
  if (USE_SUPABASE) {
    const client = supabase;
    if (!client) {
      updateLocalDatabase((db) => ({
        ...db,
        mockShipments: db.mockShipments.filter((item) => item.id !== id),
      }));
      return;
    }
    const { error } = await client.from('mock_shipments' as any).delete().eq('id', id);
    if (error) throw error;
    return;
  }

  updateLocalDatabase((db) => ({
    ...db,
    mockShipments: db.mockShipments.filter((item) => item.id !== id),
  }));
}

export async function ensureSeedData() {
  if (!USE_SUPABASE) return readLocalDatabase();

  const [appSettings, brandingSettings, mockShipments, logs] = await Promise.all([
    getAppSettings(),
    getBrandingSettings(),
    listMockShipments().catch(() => DEFAULT_DEMO_MOCKS),
    listTrackingLogs().catch(() => []),
  ]);

  return {
    appSettings,
    brandingSettings,
    mockShipments,
    logs,
  };
}
