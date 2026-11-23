ALTER TABLE public.pulse_accounts
  ADD COLUMN IF NOT EXISTS alert_state text NOT NULL DEFAULT 'ok',
  ADD COLUMN IF NOT EXISTS alert_state_changed_at timestamptz;
ALTER TABLE public.pulse_accounts DROP CONSTRAINT IF EXISTS pulse_accounts_alert_state_check;
ALTER TABLE public.pulse_accounts ADD CONSTRAINT pulse_accounts_alert_state_check CHECK (alert_state IN ('ok','warned','alerted'));

ALTER TABLE public.pulse_alert_deliveries
  ADD COLUMN IF NOT EXISTS send_key text,
  ADD COLUMN IF NOT EXISTS provider_message_id text,
  ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error text,
  ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS bounced_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS pulse_alert_deliveries_send_key_idx ON public.pulse_alert_deliveries(send_key) WHERE send_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS pulse_alert_deliveries_provider_idx ON public.pulse_alert_deliveries(provider_message_id) WHERE provider_message_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.pulse_email_events (
  event_id text PRIMARY KEY,
  provider_message_id text,
  event_type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.pulse_email_events TO service_role;
ALTER TABLE public.pulse_email_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pulse_cron_heartbeats (
  job text PRIMARY KEY,
  last_started_at timestamptz,
  last_finished_at timestamptz,
  last_result jsonb,
  last_watchdog_alert_at timestamptz
);
GRANT ALL ON public.pulse_cron_heartbeats TO service_role;
ALTER TABLE public.pulse_cron_heartbeats ENABLE ROW LEVEL SECURITY;

-- ok -> warned after one missed window; any fresh check-in (or pause) resets to ok.
-- 'alerted' is set by the server only after the alert email is accepted.
-- Interval arithmetic is in absolute seconds, so DST and time zones never shift it.
CREATE OR REPLACE FUNCTION public.pulse_advance_alert_states()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  UPDATE public.pulse_accounts a SET
    alert_state = s.next_state, alert_state_changed_at = now()
  FROM (
    SELECT id, CASE
      WHEN last_checkin IS NULL OR (paused_until IS NOT NULL AND paused_until >= now())
        OR last_checkin + make_interval(secs => interval_ms / 1000.0) >= now() THEN 'ok'
      WHEN alert_state = 'alerted' THEN 'alerted'
      ELSE 'warned' END AS next_state
    FROM public.pulse_accounts
  ) s
  WHERE a.id = s.id AND a.alert_state <> s.next_state;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.pulse_advance_alert_states() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pulse_advance_alert_states() TO service_role;

-- Overdue accounts that have no email receipt for this missed cycle, or whose
-- earlier attempt failed and is due for a retry (max 5 attempts).
CREATE OR REPLACE FUNCTION public.pulse_overdue_accounts(_limit integer DEFAULT 100)
RETURNS TABLE(id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.id FROM public.pulse_accounts a
  WHERE a.last_checkin IS NOT NULL
    AND a.alert_state <> 'alerted'
    AND (a.paused_until IS NULL OR a.paused_until < now())
    AND a.last_checkin + make_interval(secs => (a.interval_ms * 2) / 1000.0) < now()
    AND a.last_checkin > now() - interval '30 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.pulse_alert_deliveries d
      WHERE d.account_id = a.id AND d.channel = 'email'
        AND d.checkin_key = 'missed-' || floor(extract(epoch FROM a.last_checkin) * 1000)::bigint::text
        AND NOT (d.status = 'failed' AND d.attempts < 5 AND (d.next_attempt_at IS NULL OR d.next_attempt_at <= now()))
    )
  ORDER BY a.last_checkin
  LIMIT _limit;
$$;
REVOKE ALL ON FUNCTION public.pulse_overdue_accounts(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pulse_overdue_accounts(integer) TO service_role;