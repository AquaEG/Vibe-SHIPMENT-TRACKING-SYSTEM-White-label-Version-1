import type { AppSettings, BrandingSettings, MockShipment, ShipmentStatus, TrackingLog } from './types';
import { generateId } from './utils';

export const SHIPMENT_STATUSES: ShipmentStatus[] = [
  'Pending',
  'Shipment Created',
  'Picked Up',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Failed Delivery',
  'Returned',
  'Delayed',
  'Exception',
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  id: 1,
  integration_name: 'TrackFlow n8n',
  webhook_url: import.meta.env.VITE_DEFAULT_WEBHOOK_URL ?? '',
  production_webhook_url: import.meta.env.VITE_DEFAULT_PRODUCTION_WEBHOOK_URL ?? '',
  request_method: (import.meta.env.VITE_DEFAULT_REQUEST_METHOD ?? 'POST').toUpperCase() as 'GET' | 'POST',
  auth_type: (import.meta.env.VITE_DEFAULT_AUTH_TYPE ?? 'none') as AppSettings['auth_type'],
  auth_token: import.meta.env.VITE_DEFAULT_AUTH_TOKEN ?? '',
  auth_header_name: 'X-API-Key',
  custom_headers_json: {},
  content_type: import.meta.env.VITE_DEFAULT_CONTENT_TYPE ?? 'application/json',
  timeout_ms: 10000,
  tracking_param_name: import.meta.env.VITE_DEFAULT_TRACKING_PARAM_NAME ?? 'trackingNumber',
  request_body_template: '{"trackingNumber":"{{trackingNumber}}"}',
  live_mode_enabled: false,
  mock_mode_enabled: true,
  updated_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

export const DEFAULT_BRANDING_SETTINGS: BrandingSettings = {
  id: 1,
  company_name: import.meta.env.VITE_DEFAULT_COMPANY_NAME ?? 'TrackFlow Logistics',
  logo_url: '',
  primary_color: '#38bdf8',
  secondary_color: '#0f172a',
  support_email: 'support@trackflow.app',
  tracking_page_title: 'Track a shipment in real time',
  footer_text: 'White-label tracking portal powered by TrackFlow.',
  favicon_url: '',
  updated_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

export const DEFAULT_DEMO_MOCKS: MockShipment[] = [
  {
    id: generateId('mock'),
    tracking_number: 'TRK-102938',
    shipment_status: 'In Transit',
    current_location: 'Cairo Hub',
    estimated_delivery: '2026-04-02',
    sender_name: 'MarketMinds Store',
    recipient_name: 'Ahmed Waheed',
    shipping_type: 'Express',
    last_update: '2026-03-30T11:20:00Z',
    timeline_json: [
      {
        status: 'Shipment Created',
        location: 'Alexandria',
        timestamp: '2026-03-29T09:00:00Z',
        note: '',
      },
      {
        status: 'Picked Up',
        location: 'Alexandria',
        timestamp: '2026-03-29T13:30:00Z',
        note: '',
      },
      {
        status: 'In Transit',
        location: 'Cairo Hub',
        timestamp: '2026-03-30T08:10:00Z',
        note: '',
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: generateId('mock'),
    tracking_number: 'TRK-550012',
    shipment_status: 'Out for Delivery',
    current_location: 'Giza Dispatch Center',
    estimated_delivery: '2026-03-31',
    sender_name: 'NorthStar Trading',
    recipient_name: 'Mona Hassan',
    shipping_type: 'Standard',
    last_update: '2026-03-31T08:30:00Z',
    timeline_json: [
      {
        status: 'Shipment Created',
        location: 'Cairo',
        timestamp: '2026-03-29T06:30:00Z',
        note: 'Booking confirmed',
      },
      {
        status: 'Picked Up',
        location: 'Cairo',
        timestamp: '2026-03-29T10:20:00Z',
        note: '',
      },
      {
        status: 'In Transit',
        location: 'Giza Dispatch Center',
        timestamp: '2026-03-30T14:50:00Z',
        note: '',
      },
      {
        status: 'Out for Delivery',
        location: 'Giza Dispatch Center',
        timestamp: '2026-03-31T08:30:00Z',
        note: 'Courier is on route',
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEFAULT_LOGS: TrackingLog[] = [
  {
    id: generateId('log'),
    tracking_number: 'TRK-102938',
    mode: 'mock',
    is_success: true,
    shipment_status: 'In Transit',
    current_location: 'Cairo Hub',
    request_payload: { trackingNumber: 'TRK-102938' },
    response_payload: { success: true },
    error_message: '',
    response_time_ms: 156,
    created_at: '2026-03-30T11:20:00Z',
  },
];
