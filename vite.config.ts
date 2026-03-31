import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'trackflow-live-proxy',
      configureServer(server) {
        server.middlewares.use('/api/tracking-proxy', async (req, res, next) => {
          if (req.method !== 'POST') {
            next();
            return;
          }

          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          req.on('end', async () => {
            try {
              const parsedPayload = JSON.parse(Buffer.concat(chunks).toString('utf8')) as {
                trackingNumber?: string;
                webhookUrl?: string;
                productionWebhookUrl?: string;
                webhookMode?: 'test' | 'production';
                requestMethod?: 'GET' | 'POST';
                authType?: string;
                authToken?: string;
                authHeaderName?: string;
                customHeadersJson?: Record<string, string>;
                contentType?: string;
                timeoutMs?: number;
                trackingParamName?: string;
                requestBodyTemplate?: string;
              } | undefined;
              const payload: {
                trackingNumber?: string;
                webhookUrl?: string;
                productionWebhookUrl?: string;
                webhookMode?: 'test' | 'production';
                requestMethod?: 'GET' | 'POST';
                authType?: string;
                authToken?: string;
                authHeaderName?: string;
                customHeadersJson?: Record<string, string>;
                contentType?: string;
                timeoutMs?: number;
                trackingParamName?: string;
                requestBodyTemplate?: string;
              } = parsedPayload ?? {};

              const webhookUrlCandidate =
                payload.webhookMode === 'production'
                  ? payload.productionWebhookUrl || payload.webhookUrl || ''
                  : payload.webhookUrl || payload.productionWebhookUrl || '';
              const webhookUrl = webhookUrlCandidate.trim();
              if (!webhookUrl) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Webhook URL is not configured.' }));
                return;
              }

              const target = new URL(webhookUrl);
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

              const trackingNumber = payload.trackingNumber?.trim() || '';
              const requestMethod = payload.requestMethod || 'POST';
              const timeoutMs = Math.max(1000, payload.timeoutMs || 10000);
              const abortSignal = AbortSignal.timeout(timeoutMs);

              if (requestMethod === 'GET') {
                target.searchParams.set(payload.trackingParamName || 'trackingNumber', trackingNumber);
              }

              const requestOptions: RequestInit = {
                method: requestMethod,
                headers,
                signal: abortSignal,
              };

              if (requestMethod !== 'GET') {
                const template = payload.requestBodyTemplate?.trim();
                const body = template && template.length
                  ? template
                      .replaceAll('{{trackingNumber}}', trackingNumber)
                      .replaceAll('{{tracking_number}}', trackingNumber)
                      .replaceAll('{{tracking_id}}', trackingNumber)
                  : JSON.stringify({ trackingNumber });

                if ((payload.contentType || '').includes('application/x-www-form-urlencoded')) {
                  requestOptions.body = new URLSearchParams({ trackingNumber }).toString();
                } else {
                  requestOptions.body = body;
                }
              }

              const upstream = await fetch(target.toString(), requestOptions);
              const text = await upstream.text();
              res.statusCode = upstream.status;
              res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
              res.end(text);
            } catch (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Proxy request failed.' }));
            }
          });
        });
      },
    },
  ],
  server: {
    port: 5173,
  },
});
