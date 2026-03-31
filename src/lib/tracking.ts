import { env } from './env';
import { appendTrackingLog, getAppSettings, getPublicAppSettings, listMockShipments } from './repository';
import { applyTemplate, parseJsonObject, safeString } from './utils';
import type { AppSettings, MockShipment, TimelineItem, TrackingError, TrackingLog, TrackingResponse, TrackingResult } from './types';

type TrackingOutcome = {
  result: TrackingResponse;
  log: TrackingLog;
};

function trackingError(error: string): TrackingError {
  return { success: false, error };
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function isTrackingError(result: TrackingResponse): result is TrackingError {
  return result.success === false;
}

export function normalizeTrackingResponse(raw: unknown, trackingNumber: string): TrackingResponse {
  if (!raw || typeof raw !== 'object') {
    return trackingError('Unexpected integration response.');
  }

  const record = raw as Record<string, unknown>;
  if (record.success === false) {
    return trackingError(safeString(record.error, 'Tracking number not found'));
  }

  const trackingId = safeString(record.tracking_id ?? record.trackingNumber ?? record.tracking_number ?? trackingNumber, trackingNumber);
  const shipmentStatus = safeString(record.shipment_status ?? record.status ?? 'Pending', 'Pending') as TrackingResult['shipment_status'];
  const currentLocation = safeString(record.current_location ?? record.location ?? '', '');
  const estimatedDelivery = safeString(record.estimated_delivery ?? record.eta ?? '', '');
  const recipientName = safeString(record.recipient_name ?? record.recipient ?? '', '');
  const senderName = safeString(record.sender_name ?? record.sender ?? '', '');
  const shippingType = safeString(record.shipping_type ?? record.shippingType ?? 'Standard', 'Standard');
  const lastUpdate = safeString(record.last_update ?? record.updated_at ?? new Date().toISOString(), new Date().toISOString());
  const timelineSource = Array.isArray(record.timeline) ? record.timeline : Array.isArray(record.events) ? record.events : [];

  const timeline: TimelineItem[] = timelineSource.map((item) => {
    const timelineItem = item as Record<string, unknown>;
    return {
      status: safeString(timelineItem.status ?? timelineItem.label ?? 'Pending', 'Pending') as TimelineItem['status'],
      location: safeString(timelineItem.location ?? timelineItem.city ?? '', ''),
      timestamp: safeString(timelineItem.timestamp ?? timelineItem.time ?? new Date().toISOString(), new Date().toISOString()),
      note: safeString(timelineItem.note ?? '', ''),
    };
  });

  return {
    success: true,
    tracking_id: trackingId,
    shipment_status: shipmentStatus,
    current_location: currentLocation,
    estimated_delivery: estimatedDelivery,
    recipient_name: recipientName,
    sender_name: senderName,
    shipping_type: shippingType,
    last_update: lastUpdate,
    timeline,
  };
}

function buildHeaders(settings: AppSettings) {
  const headers: Record<string, string> = {
    'Content-Type': settings.content_type,
    ...settings.custom_headers_json,
  };

  if (settings.auth_type === 'bearer' && settings.auth_token) {
    headers.Authorization = `Bearer ${settings.auth_token}`;
  }

  if (settings.auth_type === 'api_key' && settings.auth_token) {
    headers['X-API-Key'] = settings.auth_token;
  }

  if (settings.auth_type === 'custom_header' && settings.auth_token) {
    headers[settings.auth_header_name || 'X-API-Key'] = settings.auth_token;
  }

  return headers;
}

function buildRequestPayload(settings: AppSettings, trackingNumber: string) {
  const defaults = {
    trackingNumber,
    tracking_number: trackingNumber,
    tracking_id: trackingNumber,
  };

  if (!settings.request_body_template?.trim()) {
    return defaults;
  }

  try {
    const template = applyTemplate(settings.request_body_template, defaults);
    return parseJsonObject(template);
  } catch {
    return defaults;
  }
}

function resolveWebhookUrl(settings: AppSettings) {
  const testWebhook = settings.webhook_url.trim();
  const productionWebhook = settings.production_webhook_url.trim();
  if (settings.webhook_mode === 'production') {
    return productionWebhook || testWebhook;
  }
  return testWebhook || productionWebhook;
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return { raw: text };
}

async function trackMockShipment(trackingNumber: string): Promise<TrackingResponse> {
  const shipments = await listMockShipments();
  const shipment = shipments.find((item) => item.tracking_number.toLowerCase() === trackingNumber.toLowerCase());

  if (!shipment) {
    return trackingError('Tracking number not found in mock data.');
  }

  return {
    success: true,
    tracking_id: shipment.tracking_number,
    shipment_status: shipment.shipment_status,
    current_location: shipment.current_location,
    estimated_delivery: shipment.estimated_delivery,
    recipient_name: shipment.recipient_name,
    sender_name: shipment.sender_name,
    shipping_type: shipment.shipping_type,
    last_update: shipment.last_update,
    timeline: shipment.timeline_json,
  };
}

async function trackViaProxy(settings: AppSettings, trackingNumber: string) {
  const response = await fetch('/api/tracking-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      trackingNumber,
      webhookUrl: settings.webhook_url,
      productionWebhookUrl: settings.production_webhook_url,
      webhookMode: settings.webhook_mode,
      requestMethod: settings.request_method,
      authType: settings.auth_type,
      authToken: settings.auth_token,
      authHeaderName: settings.auth_header_name,
      customHeadersJson: settings.custom_headers_json,
      contentType: settings.content_type,
      timeoutMs: settings.timeout_ms,
      trackingParamName: settings.tracking_param_name,
      requestBodyTemplate: settings.request_body_template,
    }),
  });

  const body = await readResponseBody(response);
  if (!response.ok) {
    return trackingError(safeString((body as Record<string, unknown>).error, 'Live tracking failed.'));
  }

  return normalizeTrackingResponse(body, trackingNumber);
}

async function trackDirectLiveShipment(settings: AppSettings, trackingNumber: string) {
  const webhookUrl = resolveWebhookUrl(settings);
  if (!webhookUrl) {
    return trackingError('Webhook URL is not configured.');
  }

  let url: URL;
  try {
    url = new URL(webhookUrl);
  } catch {
    return trackingError('Webhook URL is invalid.');
  }
  const payload = buildRequestPayload(settings, trackingNumber);
  const requestOptions: RequestInit = {
    method: settings.request_method,
    headers: buildHeaders(settings),
    signal: AbortSignal.timeout(Math.max(1000, settings.timeout_ms)),
  };

  if (settings.request_method === 'GET') {
    url.searchParams.set(settings.tracking_param_name || 'trackingNumber', trackingNumber);
  } else if (settings.content_type.includes('json')) {
    requestOptions.body = JSON.stringify(payload);
  } else if (settings.content_type.includes('application/x-www-form-urlencoded')) {
    requestOptions.body = new URLSearchParams(payload as Record<string, string>).toString();
  } else {
    requestOptions.body = JSON.stringify(payload);
  }

  const response = await fetch(url.toString(), requestOptions);
  const body = await readResponseBody(response);
  if (!response.ok) {
    return trackingError(safeString((body as Record<string, unknown>).error, `Live integration returned ${response.status}.`));
  }

  return normalizeTrackingResponse(body, trackingNumber);
}

async function trackLiveShipment(settings: AppSettings, trackingNumber: string) {
  if (env.trackingProxyUrl || typeof window !== 'undefined') {
    return trackViaProxy(settings, trackingNumber);
  }

  if (!env.allowDirectLiveIntegration) {
    return trackingError('Live mode is enabled, but no tracking proxy is configured.');
  }

  return trackDirectLiveShipment(settings, trackingNumber);
}

async function createLog(
  trackingNumber: string,
  mode: 'mock' | 'live',
  result: TrackingResponse,
  requestPayload: Record<string, unknown>,
  responsePayload: Record<string, unknown>,
  responseTimeMs: number | null
) {
  const log: TrackingLog = {
    id: crypto.randomUUID(),
    tracking_number: trackingNumber,
    mode,
    is_success: !isTrackingError(result),
    shipment_status: !isTrackingError(result) ? result.shipment_status : 'Exception',
    current_location: !isTrackingError(result) ? result.current_location : '',
    request_payload: requestPayload,
    response_payload: responsePayload,
    error_message: isTrackingError(result) ? result.error : '',
    response_time_ms: responseTimeMs,
    created_at: new Date().toISOString(),
  };

  try {
    await appendTrackingLog(log);
  } catch {
    // Logging should never block the user-facing tracking result.
  }
  return log;
}

export async function trackShipment(trackingNumber: string) {
  const cleaned = trackingNumber.trim();
  if (!cleaned) {
    return { result: trackingError('Enter a tracking number.'), log: null };
  }

  const settings = await getPublicAppSettings();
  const startedAt = performance.now();

  if (settings.live_mode_enabled) {
    const result = await trackLiveShipment(settings, cleaned);
    const log = await createLog(
      cleaned,
      'live',
      result,
      { trackingNumber: cleaned, settingsId: settings.id },
      toRecord(result),
      Math.round(performance.now() - startedAt)
    );
    return { result, log };
  }

  if (settings.mock_mode_enabled) {
    const result = await trackMockShipment(cleaned);
    const log = await createLog(cleaned, 'mock', result, { trackingNumber: cleaned }, toRecord(result), Math.round(performance.now() - startedAt));
    return { result, log };
  }

  const result: TrackingError = {
    success: false,
    error: 'Tracking is currently unavailable. Enable live or mock mode in admin settings.',
  };
  const log = await createLog(cleaned, 'mock', result, { trackingNumber: cleaned }, toRecord(result), Math.round(performance.now() - startedAt));
  return { result, log };
}

export async function testIntegrationConnection(testTrackingNumber?: string) {
  const settings = await getAppSettings();
  const trackingNumber = testTrackingNumber?.trim() || 'TRK-102938';
  const startedAt = performance.now();
  const result = await trackLiveShipment(
    {
      ...settings,
      mock_mode_enabled: false,
      live_mode_enabled: true,
    },
    trackingNumber
  );

  const log = await createLog(
    trackingNumber,
    'live',
    result,
    { trackingNumber, test: true },
    toRecord(result),
    Math.round(performance.now() - startedAt)
  );

  return { result, log };
}

export async function trackMockShipmentByNumber(trackingNumber: string) {
  return trackMockShipment(trackingNumber);
}
