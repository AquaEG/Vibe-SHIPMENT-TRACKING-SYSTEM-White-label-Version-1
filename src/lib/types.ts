export type ShipmentStatus =
  | 'Pending'
  | 'Shipment Created'
  | 'Picked Up'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Failed Delivery'
  | 'Returned'
  | 'Delayed'
  | 'Exception';

export type IntegrationAuthType = 'none' | 'bearer' | 'api_key' | 'custom_header';
export type RequestMode = 'GET' | 'POST';
export type SourceMode = 'mock' | 'live';

export interface TimelineItem {
  status: ShipmentStatus;
  location: string;
  timestamp: string;
  note?: string;
}

export interface TrackingResult {
  success: true;
  tracking_id: string;
  shipment_status: ShipmentStatus;
  current_location: string;
  estimated_delivery: string;
  recipient_name: string;
  sender_name: string;
  shipping_type: string;
  last_update: string;
  timeline: TimelineItem[];
}

export interface TrackingError {
  success: false;
  error: string;
}

export type TrackingResponse = TrackingResult | TrackingError;

export interface AppSettings {
  id: number;
  integration_name: string;
  webhook_url: string;
  production_webhook_url: string;
  request_method: RequestMode;
  auth_type: IntegrationAuthType;
  auth_token: string;
  auth_header_name: string;
  custom_headers_json: Record<string, string>;
  content_type: string;
  timeout_ms: number;
  tracking_param_name: string;
  request_body_template: string;
  live_mode_enabled: boolean;
  mock_mode_enabled: boolean;
  updated_at: string;
  created_at: string;
}

export interface BrandingSettings {
  id: number;
  company_name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  support_email: string;
  tracking_page_title: string;
  footer_text: string;
  favicon_url: string;
  updated_at: string;
  created_at: string;
}

export interface TrackingLog {
  id: string;
  tracking_number: string;
  mode: SourceMode;
  is_success: boolean;
  shipment_status: string;
  current_location: string;
  request_payload: Record<string, unknown>;
  response_payload: Record<string, unknown>;
  error_message: string;
  response_time_ms: number | null;
  created_at: string;
}

export interface MockShipment {
  id: string;
  tracking_number: string;
  shipment_status: ShipmentStatus;
  current_location: string;
  estimated_delivery: string;
  sender_name: string;
  recipient_name: string;
  shipping_type: string;
  last_update: string;
  timeline_json: TimelineItem[];
  created_at: string;
  updated_at: string;
}

export interface RepositoryState {
  appSettings: AppSettings;
  brandingSettings: BrandingSettings;
  trackingLogs: TrackingLog[];
  mockShipments: MockShipment[];
}
