import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_APP_SETTINGS, DEFAULT_BRANDING_SETTINGS, DEFAULT_DEMO_MOCKS, DEFAULT_LOGS } from '../lib/constants';
import { hasSupabaseConfig } from '../lib/env';
import {
  getAppSettings,
  getBrandingSettings,
  getPublicAppSettings,
  getPublicBrandingSettings,
  listMockShipments,
  listTrackingLogs,
  saveAppSettings,
  saveBrandingSettings,
  saveMockShipment,
  deleteMockShipment,
} from '../lib/repository';
import { supabase } from '../lib/supabase';
import { trackMockShipmentByNumber, trackShipment } from '../lib/tracking';
import type { AppSettings, BrandingSettings, MockShipment, TrackingLog, TrackingResponse } from '../lib/types';

type AppDataState = {
  appSettings: AppSettings;
  brandingSettings: BrandingSettings;
  trackingLogs: TrackingLog[];
  mockShipments: MockShipment[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  updateAppSettings: (settings: AppSettings) => Promise<void>;
  updateBrandingSettings: (settings: BrandingSettings) => Promise<void>;
  upsertMockShipment: (shipment: MockShipment) => Promise<void>;
  removeMockShipment: (id: string) => Promise<void>;
  runTracking: (trackingNumber: string) => Promise<TrackingResponse>;
  runMockTracking: (trackingNumber: string) => Promise<TrackingResponse>;
  isSupabaseConnected: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<void>;
  authLoading: boolean;
};

const AppDataContext = createContext<AppDataState | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(DEFAULT_BRANDING_SETTINGS);
  const [trackingLogs, setTrackingLogs] = useState<TrackingLog[]>(DEFAULT_LOGS);
  const [mockShipments, setMockShipments] = useState<MockShipment[]>(DEFAULT_DEMO_MOCKS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [isAuthenticated, setIsAuthenticated] = useState(!hasSupabaseConfig());

  async function loadAll() {
    setIsLoading(true);
    setError(null);
    try {
      const [publicAppSettings, publicBranding] = await Promise.all([getPublicAppSettings(), getPublicBrandingSettings()]);
      setAppSettings(publicAppSettings);
      setBrandingSettings(publicBranding);

      if (!supabase) {
        const [nextLogs, nextShipments] = await Promise.all([
          listTrackingLogs().catch(() => DEFAULT_LOGS),
          listMockShipments().catch(() => DEFAULT_DEMO_MOCKS),
        ]);
        setTrackingLogs(nextLogs);
        setMockShipments(nextShipments);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setTrackingLogs([]);
        setMockShipments(await listMockShipments().catch(() => DEFAULT_DEMO_MOCKS));
        return;
      }

      const [nextAppSettings, nextLogs, nextShipments] = await Promise.all([
        getAppSettings(),
        listTrackingLogs().catch(() => DEFAULT_LOGS),
        listMockShipments().catch(() => DEFAULT_DEMO_MOCKS),
      ]);

      setAppSettings(nextAppSettings);
      setTrackingLogs(nextLogs);
      setMockShipments(nextShipments);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load TrackFlow data.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      setIsAuthenticated(true);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsAuthenticated(Boolean(data.session));
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setAuthLoading(false);
      void loadAll();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function refreshAll() {
    await loadAll();
  }

  async function updateAppSettings(settings: AppSettings) {
    setIsSaving(true);
    setError(null);
    try {
      const saved = await saveAppSettings(settings);
      setAppSettings(saved);
      await refreshAll();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save app settings.');
      throw saveError;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateBrandingSettings(settings: BrandingSettings) {
    setIsSaving(true);
    setError(null);
    try {
      const saved = await saveBrandingSettings(settings);
      setBrandingSettings(saved);
      await refreshAll();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save branding settings.');
      throw saveError;
    } finally {
      setIsSaving(false);
    }
  }

  async function upsertMockShipment(shipment: MockShipment) {
    setIsSaving(true);
    setError(null);
    try {
      const saved = await saveMockShipment(shipment);
      setMockShipments((current) => {
        const next = current.filter((item) => item.id !== saved.id);
        return [saved, ...next];
      });
      await refreshAll();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save mock shipment.');
      throw saveError;
    } finally {
      setIsSaving(false);
    }
  }

  async function removeMockShipment(id: string) {
    setIsSaving(true);
    setError(null);
    try {
      await deleteMockShipment(id);
      setMockShipments((current) => current.filter((item) => item.id !== id));
      await refreshAll();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete mock shipment.');
      throw deleteError;
    } finally {
      setIsSaving(false);
    }
  }

  async function runTracking(trackingNumber: string) {
    const { result, log } = await trackShipment(trackingNumber);
    if (log) {
      setTrackingLogs((current) => [log, ...current.filter((item) => item.id !== log.id)]);
    }
    return result;
  }

  async function runMockTracking(trackingNumber: string) {
    return trackMockShipmentByNumber(trackingNumber);
  }

  async function signIn(email: string, password: string) {
    if (!supabase) {
      setIsAuthenticated(true);
      localStorage.setItem('trackflow-demo-admin', JSON.stringify({ email, session: 'demo' }));
      return { ok: true };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return { ok: false, message: signInError.message };
    }

    setIsAuthenticated(true);
    return { ok: true };
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    localStorage.removeItem('trackflow-demo-admin');
  }

  return (
    <AppDataContext.Provider
      value={{
        appSettings,
        brandingSettings,
        trackingLogs,
        mockShipments,
        isLoading,
        isSaving,
        error,
        refreshAll,
        updateAppSettings,
        updateBrandingSettings,
        upsertMockShipment,
        removeMockShipment,
        runTracking,
        runMockTracking,
        isSupabaseConnected: hasSupabaseConfig(),
        isAuthenticated,
        signIn,
        signOut,
        authLoading,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
}
