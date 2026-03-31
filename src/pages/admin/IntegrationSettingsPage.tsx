import { useEffect, useState } from 'react';
import { ShieldCheck, TestTube2 } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../../components/ui/Field';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Switch } from '../../components/ui/Switch';
import { Badge } from '../../components/ui/Badge';
import { testIntegrationConnection } from '../../lib/tracking';
import { parseJsonObject } from '../../lib/utils';
import type { AppSettings } from '../../lib/types';

export function IntegrationSettingsPage() {
  const { appSettings, updateAppSettings, isSaving } = useAppData();
  const [draft, setDraft] = useState<AppSettings>(appSettings);
  const [headersText, setHeadersText] = useState(JSON.stringify(appSettings.custom_headers_json, null, 2));
  const [status, setStatus] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testTrackingNumber, setTestTrackingNumber] = useState('TRK-102938');

  useEffect(() => {
    setDraft(appSettings);
    setHeadersText(JSON.stringify(appSettings.custom_headers_json, null, 2));
  }, [appSettings]);

  async function handleSave() {
    setStatus(null);
    try {
      const custom_headers_json = headersText.trim()
        ? Object.fromEntries(
            Object.entries(parseJsonObject(headersText)).map(([key, value]) => [key, String(value)])
          )
        : {};
      await updateAppSettings({
        ...draft,
        custom_headers_json: custom_headers_json as AppSettings['custom_headers_json'],
      });
      setStatus('Settings saved successfully.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to save settings.');
    }
  }

  async function handleTest() {
    setTesting(true);
    setStatus(null);
    try {
      const result = await testIntegrationConnection(testTrackingNumber);
      setStatus(result.result.success ? 'Connection test succeeded.' : result.result.error);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Connection test failed.');
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Integration</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">Live tracking settings</h2>
          <p className="mt-2 text-sm text-slate-400">Configure the webhook, auth, payload, and runtime mode without code changes.</p>
        </div>
        <Badge className="border-white/10 bg-white/5 text-slate-200">{appSettings.integration_name}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration settings</CardTitle>
          <CardDescription>These values are persisted in Supabase and mirrored in local demo mode.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>Integration name</FieldLabel>
              <Input value={draft.integration_name} onChange={(event) => setDraft({ ...draft, integration_name: event.target.value })} />
            </Field>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field>
                <FieldLabel>Webhook / API URL</FieldLabel>
                <Input value={draft.webhook_url} onChange={(event) => setDraft({ ...draft, webhook_url: event.target.value })} />
                <FieldDescription>Use this for testing mode.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel>Production webhook URL</FieldLabel>
                <Input
                  value={draft.production_webhook_url}
                  onChange={(event) => setDraft({ ...draft, production_webhook_url: event.target.value })}
                  placeholder="https://..."
                />
                <FieldDescription>Use this for live mode in production.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel>Tracking parameter key</FieldLabel>
                <Input value={draft.tracking_param_name} onChange={(event) => setDraft({ ...draft, tracking_param_name: event.target.value })} />
              </Field>
              <Field>
                <FieldLabel>Webhook target</FieldLabel>
                <Select
                  value={draft.webhook_mode}
                  onChange={(event) => setDraft({ ...draft, webhook_mode: event.target.value as AppSettings['webhook_mode'] })}
                >
                  <option value="test">Testing webhook</option>
                  <option value="production">Production webhook</option>
                </Select>
                <FieldDescription>Choose which webhook the live integration uses right now.</FieldDescription>
              </Field>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <Field>
                <FieldLabel>Request method</FieldLabel>
                <Select value={draft.request_method} onChange={(event) => setDraft({ ...draft, request_method: event.target.value as AppSettings['request_method'] })}>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Auth type</FieldLabel>
                <Select value={draft.auth_type} onChange={(event) => setDraft({ ...draft, auth_type: event.target.value as AppSettings['auth_type'] })}>
                  <option value="none">None</option>
                  <option value="bearer">Bearer</option>
                  <option value="api_key">API Key</option>
                  <option value="custom_header">Custom header</option>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Auth token / key</FieldLabel>
                <Input value={draft.auth_token} onChange={(event) => setDraft({ ...draft, auth_token: event.target.value })} />
              </Field>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field>
                <FieldLabel>Custom auth header name</FieldLabel>
                <Input
                  value={draft.auth_header_name}
                  onChange={(event) => setDraft({ ...draft, auth_header_name: event.target.value })}
                  placeholder="X-API-Key"
                />
              </Field>
              <Field>
                <FieldLabel>Request content type</FieldLabel>
                <Input value={draft.content_type} onChange={(event) => setDraft({ ...draft, content_type: event.target.value })} />
              </Field>
            </div>
              <Field>
                <FieldLabel>Custom headers JSON</FieldLabel>
                <Textarea
                  value={headersText}
                  onChange={(event) => setHeadersText(event.target.value)}
                />
                <FieldDescription>Use a JSON object like {"{\"X-Client\":\"TrackFlow\"}"}</FieldDescription>
              </Field>
            <Field>
              <FieldLabel>Request body template</FieldLabel>
              <Textarea
                value={draft.request_body_template}
                onChange={(event) => setDraft({ ...draft, request_body_template: event.target.value })}
                placeholder='{"trackingNumber":"{{trackingNumber}}"}'
              />
            </Field>
            <div className="grid gap-4 lg:grid-cols-3">
              <Field>
                <FieldLabel>Timeout (ms)</FieldLabel>
                <Input
                  type="number"
                  value={draft.timeout_ms}
                  onChange={(event) => setDraft({ ...draft, timeout_ms: Number(event.target.value) })}
                />
              </Field>
              <Field>
                <FieldLabel>Test tracking number</FieldLabel>
                <Input
                  value={testTrackingNumber}
                  onChange={(event) => setTestTrackingNumber(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Runtime mode</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  <Switch checked={draft.live_mode_enabled} onChange={(value) => setDraft({ ...draft, live_mode_enabled: value })} label="Live mode" />
                  <Switch checked={draft.mock_mode_enabled} onChange={(value) => setDraft({ ...draft, mock_mode_enabled: value })} label="Mock mode" />
                </div>
              </Field>
            </div>

            {status ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">{status}</div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void handleSave()} loading={isSaving}>
                <ShieldCheck className="size-4" />
                Save settings
              </Button>
              <Button variant="secondary" onClick={() => void handleTest()} loading={testing}>
                <TestTube2 className="size-4" />
                Test connection
              </Button>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
