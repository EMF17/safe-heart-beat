CREATE TABLE public.pulse_contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.pulse_accounts(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  provider_message_id text UNIQUE,
  status text NOT NULL DEFAULT 'sending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.pulse_contact_requests TO service_role;
REVOKE ALL ON public.pulse_contact_requests FROM anon, authenticated;
ALTER TABLE public.pulse_contact_requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX pulse_contact_requests_account_email_idx ON public.pulse_contact_requests(account_id, recipient_email, created_at DESC);
ALTER TABLE public.pulse_alert_deliveries ADD COLUMN recipient_email text;
CREATE OR REPLACE FUNCTION public.pulse_reconcile_contact_request() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.provider_message_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.pulse_email_events WHERE provider_message_id = NEW.provider_message_id AND event_type = 'email.bounced') THEN
      NEW.status := 'bounced';
    ELSIF NEW.status <> 'bounced' AND EXISTS (SELECT 1 FROM public.pulse_email_events WHERE provider_message_id = NEW.provider_message_id AND event_type = 'email.delivered') THEN
      NEW.status := 'delivered';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.pulse_reconcile_contact_request() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pulse_reconcile_contact_request() TO service_role;
CREATE TRIGGER pulse_contact_request_reconcile BEFORE INSERT OR UPDATE OF provider_message_id ON public.pulse_contact_requests FOR EACH ROW EXECUTE FUNCTION public.pulse_reconcile_contact_request();
CREATE OR REPLACE FUNCTION public.pulse_contact_request_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.event_type = 'email.bounced' THEN
    UPDATE public.pulse_contact_requests SET status = 'bounced' WHERE provider_message_id = NEW.provider_message_id;
  ELSIF NEW.event_type = 'email.delivered' THEN
    UPDATE public.pulse_contact_requests SET status = 'delivered' WHERE provider_message_id = NEW.provider_message_id AND status <> 'bounced';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.pulse_contact_request_event() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pulse_contact_request_event() TO service_role;
CREATE TRIGGER pulse_contact_request_email_event AFTER INSERT ON public.pulse_email_events FOR EACH ROW EXECUTE FUNCTION public.pulse_contact_request_event();