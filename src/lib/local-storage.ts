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
      appSettings: parsed.appSettings ?? DEFAULT_APP_SETTINGS,
      brandingSettings: parsed.brandingSettings ?? DEFAULT_BRANDING_SETTINGS,
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
