import type { VercelRequest, VercelResponse } from '@vercel/node';

type ProxyPayload = {
  trackingNumber?: string;
  webhookUrl?: string;
  productionWebhookUrl?: string;
  webhookMode?: 'test' | 'production';
  requestMethod?: 'GET' | 'POST';
  authType?: 'none' | 'bearer' | 'api_key' | 'custom_header';
  authToken?: string;
  authHeaderName?: string;
  customHeadersJson?: Record<string, string>;
  contentType?: string;
  timeoutMs?: number;
  trackingParamName?: string;
  requestBodyTemplate?: string;
};

function applyTemplate(template: string, trackingNumber: string) {
  return template
    .replaceAll('{{trackingNumber}}', trackingNumber)
    .replaceAll('{{tracking_number}}', trackingNumber)
    .replaceAll('{{tracking_id}}', trackingNumber);
}

function buildHeaders(payload: ProxyPayload) {
  const headers: Record<string, string> = {
    'Content-Type': payload.contentType || 'application/json',
    ...(payload.customHeadersJson ?? {}),
  };

  if (payload.authType === 'bearer' && payload.authToken) {
    headers.Authorization = `Bearer ${payload.authToken}`;
  }

  if (payload.authType === 'api_key' && payload.authToken) {
    headers['X-API-Key'] = payload.authToken;
  }

  if (payload.authType === 'custom_header' && payload.authToken) {
    headers[payload.authHeaderName || 'X-API-Key'] = payload.authToken;
  }

  return headers;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const payload = typeof req.body === 'string' ? (JSON.parse(req.body) as ProxyPayload) : (req.body as ProxyPayload);
  const webhookUrlCandidate =
    payload.webhookMode === 'production'
      ? payload.productionWebhookUrl || payload.webhookUrl || ''
      : payload.webhookUrl || payload.productionWebhookUrl || '';
  const webhookUrl = webhookUrlCandidate.trim();
  const trackingNumber = (payload.trackingNumber || '').trim();

  if (!webhookUrl) {
    res.status(400).json({ error: 'Webhook URL is not configured.' });
    return;
  }

  if (!trackingNumber) {
    res.status(400).json({ error: 'Tracking number is required.' });
    return;
  }

  let target: URL;
  try {
    target = new URL(webhookUrl);
  } catch {
    res.status(400).json({ error: 'Webhook URL is invalid.' });
    return;
  }

  const requestMethod = payload.requestMethod || 'POST';
  const timeoutMs = Math.max(1000, payload.timeoutMs || 10000);
  const headers = buildHeaders(payload);
  const init: RequestInit = {
    method: requestMethod,
    headers,
    signal: AbortSignal.timeout(timeoutMs),
  };

  if (requestMethod === 'GET') {
    target.searchParams.set(payload.trackingParamName || 'trackingNumber', trackingNumber);
  } else {
    const template = payload.requestBodyTemplate?.trim();
    const body = template ? applyTemplate(template, trackingNumber) : JSON.stringify({ trackingNumber });
    if ((payload.contentType || '').includes('application/x-www-form-urlencoded')) {
      init.body = new URLSearchParams({ trackingNumber }).toString();
    } else {
      init.body = body;
    }
  }

  const upstream = await fetch(target.toString(), init);
  const text = await upstream.text();

  res.status(upstream.status);
  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
  res.send(text);
}
