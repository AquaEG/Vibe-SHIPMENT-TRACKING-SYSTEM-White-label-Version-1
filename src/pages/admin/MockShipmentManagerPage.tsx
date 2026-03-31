import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../../components/ui/Field';
import { Input, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Timeline } from '../../components/tracking/Timeline';
import { Badge } from '../../components/ui/Badge';
import type { MockShipment, TimelineItem } from '../../lib/types';
import { generateId } from '../../lib/utils';

function emptyShipment(): MockShipment {
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return {
    id: generateId('mock'),
    tracking_number: '',
    shipment_status: 'Pending',
    current_location: '',
    estimated_delivery: estimatedDelivery,
    sender_name: '',
    recipient_name: '',
    shipping_type: 'Standard',
    last_update: new Date().toISOString(),
    timeline_json: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function MockShipmentManagerPage() {
  const { mockShipments, upsertMockShipment, removeMockShipment, isSaving } = useAppData();
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<MockShipment | null>(null);
  const [timelineText, setTimelineText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return mockShipments.filter((shipment) => shipment.tracking_number.toLowerCase().includes(search.toLowerCase()));
  }, [mockShipments, search]);

  function openCreate() {
    setError(null);
    const next = emptyShipment();
    setEditor(next);
    setTimelineText(JSON.stringify(next.timeline_json, null, 2));
  }

  function openEdit(shipment: MockShipment) {
    setError(null);
    setEditor(shipment);
    setTimelineText(JSON.stringify(shipment.timeline_json, null, 2));
  }

  async function handleSave() {
    if (!editor) return;
    if (!editor.tracking_number.trim()) {
      setError('Tracking number is required.');
      return;
    }
    if (!editor.estimated_delivery) {
      setError('Estimated delivery date is required.');
      return;
    }
    if (!editor.current_location.trim() || !editor.sender_name.trim() || !editor.recipient_name.trim()) {
      setError('Location, sender, and recipient are required.');
      return;
    }

    let parsedTimeline: TimelineItem[];
    try {
      parsedTimeline = JSON.parse(timelineText) as TimelineItem[];
      if (!Array.isArray(parsedTimeline)) {
        setError('Timeline JSON must be an array.');
        return;
      }
    } catch {
      setError('Timeline JSON must be a valid array of events.');
      return;
    }

    try {
      await upsertMockShipment({ ...editor, timeline_json: parsedTimeline });
      setEditor(null);
    } catch {
      setError('Failed to save mock shipment.');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Mock data</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">Shipment manager</h2>
          <p className="mt-2 text-sm text-slate-400">Create and maintain demo shipments for safe presentations and sales calls.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add mock shipment
        </Button>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <Input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by tracking number" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.length ? (
          filtered.map((shipment) => (
            <Card key={shipment.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{shipment.tracking_number}</CardTitle>
                    <CardDescription>
                      {shipment.sender_name} to {shipment.recipient_name}
                    </CardDescription>
                  </div>
                  <Badge className="border-white/10 bg-white/5 text-slate-200">{shipment.shipment_status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Location</p>
                    <p className="mt-2 text-sm text-white">{shipment.current_location}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">ETA</p>
                    <p className="mt-2 text-sm text-white">{shipment.estimated_delivery}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => openEdit(shipment)}>
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button variant="secondary" onClick={() => void removeMockShipment(shipment.id)} loading={isSaving}>
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">Timeline</p>
                  <Timeline items={shipment.timeline_json} />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="xl:col-span-2">
            <CardContent className="p-6 text-sm text-slate-400">
              No mock shipments match your search.
            </CardContent>
          </Card>
        )}
      </div>

      <Modal
        open={Boolean(editor)}
        title={editor && mockShipments.some((item) => item.id === editor.id) ? 'Edit mock shipment' : 'Add mock shipment'}
        onClose={() => setEditor(null)}
        className="max-w-4xl"
      >
        {editor ? (
          <div className="flex flex-col gap-4">
            <FieldGroup>
              <div className="grid gap-4 lg:grid-cols-2">
                <Field>
                  <FieldLabel>Tracking number</FieldLabel>
                  <Input value={editor.tracking_number} onChange={(event) => setEditor({ ...editor, tracking_number: event.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select value={editor.shipment_status} onChange={(event) => setEditor({ ...editor, shipment_status: event.target.value as MockShipment['shipment_status'] })}>
                    <option value="Pending">Pending</option>
                    <option value="Shipment Created">Shipment Created</option>
                    <option value="Picked Up">Picked Up</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Failed Delivery">Failed Delivery</option>
                    <option value="Returned">Returned</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Exception">Exception</option>
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Field>
                  <FieldLabel>Current location</FieldLabel>
                  <Input value={editor.current_location} onChange={(event) => setEditor({ ...editor, current_location: event.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Estimated delivery</FieldLabel>
                  <Input
                    type="date"
                    value={editor.estimated_delivery}
                    onChange={(event) => setEditor({ ...editor, estimated_delivery: event.target.value })}
                  />
                </Field>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Field>
                  <FieldLabel>Sender name</FieldLabel>
                  <Input value={editor.sender_name} onChange={(event) => setEditor({ ...editor, sender_name: event.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Recipient name</FieldLabel>
                  <Input value={editor.recipient_name} onChange={(event) => setEditor({ ...editor, recipient_name: event.target.value })} />
                </Field>
              </div>
              <Field>
                <FieldLabel>Shipping type</FieldLabel>
                <Input value={editor.shipping_type} onChange={(event) => setEditor({ ...editor, shipping_type: event.target.value })} />
              </Field>
              <Field>
                <FieldLabel>Timeline JSON</FieldLabel>
                <Textarea value={timelineText} onChange={(event) => setTimelineText(event.target.value)} />
                <FieldDescription>Array of events with status, location, timestamp, and optional note.</FieldDescription>
              </Field>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => void handleSave()} loading={isSaving}>
                  Save shipment
                </Button>
                <Button variant="secondary" onClick={() => setEditor(null)}>
                  Cancel
                </Button>
              </div>
              {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}
            </FieldGroup>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
