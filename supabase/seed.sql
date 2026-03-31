insert into public.mock_shipments (
  id,
  tracking_number,
  shipment_status,
  current_location,
  estimated_delivery,
  sender_name,
  recipient_name,
  shipping_type,
  last_update,
  timeline_json
)
values
(
  gen_random_uuid(),
  'TRK-102938',
  'In Transit',
  'Cairo Hub',
  '2026-04-02',
  'MarketMinds Store',
  'Ahmed Waheed',
  'Express',
  '2026-03-30T11:20:00Z',
  '[
    {"status":"Shipment Created","location":"Alexandria","timestamp":"2026-03-29T09:00:00Z","note":""},
    {"status":"Picked Up","location":"Alexandria","timestamp":"2026-03-29T13:30:00Z","note":""},
    {"status":"In Transit","location":"Cairo Hub","timestamp":"2026-03-30T08:10:00Z","note":""}
  ]'::jsonb
),
(
  gen_random_uuid(),
  'TRK-550012',
  'Out for Delivery',
  'Giza Dispatch Center',
  '2026-03-31',
  'NorthStar Trading',
  'Mona Hassan',
  'Standard',
  '2026-03-31T08:30:00Z',
  '[
    {"status":"Shipment Created","location":"Cairo","timestamp":"2026-03-29T06:30:00Z","note":"Booking confirmed"},
    {"status":"Picked Up","location":"Cairo","timestamp":"2026-03-29T10:20:00Z","note":""},
    {"status":"In Transit","location":"Giza Dispatch Center","timestamp":"2026-03-30T14:50:00Z","note":""},
    {"status":"Out for Delivery","location":"Giza Dispatch Center","timestamp":"2026-03-31T08:30:00Z","note":"Courier is on route"}
  ]'::jsonb
)
on conflict (tracking_number) do update set
  shipment_status = excluded.shipment_status,
  current_location = excluded.current_location,
  estimated_delivery = excluded.estimated_delivery,
  sender_name = excluded.sender_name,
  recipient_name = excluded.recipient_name,
  shipping_type = excluded.shipping_type,
  last_update = excluded.last_update,
  timeline_json = excluded.timeline_json;
