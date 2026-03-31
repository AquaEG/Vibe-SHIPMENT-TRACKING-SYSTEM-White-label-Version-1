import { DEFAULT_APP_SETTINGS, DEFAULT_BRANDING_SETTINGS, DEFAULT_DEMO_MOCKS, DEFAULT_LOGS } from './constants';
import type { AppSettings, BrandingSettings, MockShipment, TrackingLog } from './types';

const STORAGE_KEY = 'trackflow-demo-db';

type StoredDatabase = {
  appSettings: AppSettings;
  brandingSettings: BrandingSettings;
  trackingLogs: TrackingLog[];
  mockShipments: MockShipment[];
};

function createInitialData(): StoredDatabase {
  return {
    appSettings: DEFAULT_APP_SETTINGS,
    brandingSettings: DEFAULT_BRANDING_SETTINGS,
    trackingLogs: DEFAULT_LOGS,
    mockShipments: DEFAULT_DEMO_MOCKS,
  };
}

function nonEmpty(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export function readLocalDatabase(): StoredDatabase {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = createInitialData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredDatabase>;
    return {
      appSettings: {
        ...DEFAULT_APP_SETTINGS,
        ...(parsed.appSettings ?? {}),
        webhook_url: nonEmpty(parsed.appSettings?.webhook_url, DEFAULT_APP_SETTINGS.webhook_url),
        production_webhook_url: nonEmpty(parsed.appSettings?.production_webhook_url, DEFAULT_APP_SETTINGS.production_webhook_url),
        request_method: nonEmpty(parsed.appSettings?.request_method, DEFAULT_APP_SETTINGS.request_method) as AppSettings['request_method'],
        auth_type: nonEmpty(parsed.appSettings?.auth_type, DEFAULT_APP_SETTINGS.auth_type) as AppSettings['auth_type'],
      },
      brandingSettings: { ...DEFAULT_BRANDING_SETTINGS, ...(parsed.brandingSettings ?? {}) },
      trackingLogs: parsed.trackingLogs ?? DEFAULT_LOGS,
      mockShipments: parsed.mockShipments ?? DEFAULT_DEMO_MOCKS,
    };
  } catch {
    const initial = createInitialData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

export function writeLocalDatabase(db: StoredDatabase) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function updateLocalDatabase(updater: (db: StoredDatabase) => StoredDatabase) {
  const next = updater(readLocalDatabase());
  writeLocalDatabase(next);
  return next;
}
