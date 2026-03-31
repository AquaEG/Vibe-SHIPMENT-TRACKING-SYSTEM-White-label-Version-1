import { useEffect, useState } from 'react';
import { Palette, Save } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../../components/ui/Field';
import { Input, Textarea } from '../../components/ui/Input';
import type { BrandingSettings } from '../../lib/types';

export function BrandingSettingsPage() {
  const { brandingSettings, updateBrandingSettings, isSaving } = useAppData();
  const [draft, setDraft] = useState<BrandingSettings>(brandingSettings);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setDraft(brandingSettings);
  }, [brandingSettings]);

  async function handleSave() {
    setStatus(null);
    await updateBrandingSettings(draft);
    setStatus('Branding saved successfully.');
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Branding</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">White-label appearance</h2>
          <p className="mt-2 text-sm text-slate-400">Update the public portal identity without touching source code.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
          <Palette className="size-4 text-sky-300" />
          {draft.company_name}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branding settings</CardTitle>
          <CardDescription>Stored in Supabase and consumed by the public tracking portal at runtime.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field>
                <FieldLabel>Company name</FieldLabel>
                <Input value={draft.company_name} onChange={(event) => setDraft({ ...draft, company_name: event.target.value })} />
              </Field>
              <Field>
                <FieldLabel>Support email</FieldLabel>
                <Input value={draft.support_email} onChange={(event) => setDraft({ ...draft, support_email: event.target.value })} />
              </Field>
            </div>
            <Field>
              <FieldLabel>Logo URL</FieldLabel>
              <Input value={draft.logo_url} onChange={(event) => setDraft({ ...draft, logo_url: event.target.value })} />
              <FieldDescription>Use a light-on-dark logo for the public portal header.</FieldDescription>
            </Field>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field>
                <FieldLabel>Primary color</FieldLabel>
                <Input value={draft.primary_color} onChange={(event) => setDraft({ ...draft, primary_color: event.target.value })} />
              </Field>
              <Field>
                <FieldLabel>Secondary color</FieldLabel>
                <Input value={draft.secondary_color} onChange={(event) => setDraft({ ...draft, secondary_color: event.target.value })} />
              </Field>
            </div>
            <Field>
              <FieldLabel>Tracking page title</FieldLabel>
              <Input
                value={draft.tracking_page_title}
                onChange={(event) => setDraft({ ...draft, tracking_page_title: event.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel>Footer text</FieldLabel>
              <Textarea value={draft.footer_text} onChange={(event) => setDraft({ ...draft, footer_text: event.target.value })} />
            </Field>
            <Field>
              <FieldLabel>Favicon URL</FieldLabel>
              <Input value={draft.favicon_url} onChange={(event) => setDraft({ ...draft, favicon_url: event.target.value })} />
            </Field>

            {status ? <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">{status}</div> : null}

            <Button onClick={() => void handleSave()} loading={isSaving}>
              <Save className="size-4" />
              Save branding
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
