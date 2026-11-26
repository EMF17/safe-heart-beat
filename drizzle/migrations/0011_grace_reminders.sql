ALTER TABLE public.pulse_accounts ADD COLUMN owner_email text, ADD COLUMN owner_confirmed_email text, ADD COLUMN owner_confirm_sent_at timestamptz;
CREATE TABLE public.pulse_grace_reminders (
  account_id uuid NOT NULL,
  cycle_key text NOT NULL,
  status text NOT NULL DEFAULT 'sending',
  provider_message_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, cycle_key)
);
GRANT ALL ON public.pulse_grace_reminders TO service_role;
REVOKE ALL ON public.pulse_grace_reminders FROM anon, authenticated;
ALTER TABLE public.pulse_grace_reminders ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.pulse_grace_due_accounts(_limit integer DEFAULT 100)
RETURNS TABLE(id uuid) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT a.id FROM public.pulse_accounts a
  WHERE a.alert_state = 'warned' AND a.last_checkin IS NOT NULL
    AND a.owner_confirmed_email IS NOT NULL
    AND lower(a.owner_confirmed_email) = lower(trim(a.owner_email))
    AND (a.paused_until IS NULL OR a.paused_until < now())
    AND a.last_checkin + make_interval(secs => a.interval_ms / 1000.0) < now()
    AND a.last_checkin + make_interval(secs => (a.interval_ms * 2) / 1000.0) > now()
    AND NOT EXISTS (SELECT 1 FROM public.pulse_grace_reminders g WHERE g.account_id = a.id
      AND g.cycle_key = 'grace-' || floor(extract(epoch FROM a.last_checkin) * 1000)::bigint::text
      AND NOT (g.status = 'failed'))
  ORDER BY a.last_checkin LIMIT _limit;
$$;
REVOKE ALL ON FUNCTION public.pulse_grace_due_accounts(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pulse_grace_due_accounts(integer) TO service_role;