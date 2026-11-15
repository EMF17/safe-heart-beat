ALTER TABLE public.pulse_accounts ADD COLUMN IF NOT EXISTS contact_phone text;
CREATE TABLE public.pulse_alert_deliveries (
 account_id uuid NOT NULL REFERENCES public.pulse_accounts(id) ON DELETE CASCADE,
 checkin_key text NOT NULL,
 channel text NOT NULL,
 status text NOT NULL DEFAULT 'sending',
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (account_id, checkin_key, channel)
);
GRANT ALL ON public.pulse_alert_deliveries TO service_role;
ALTER TABLE public.pulse_alert_deliveries ENABLE ROW LEVEL SECURITY;