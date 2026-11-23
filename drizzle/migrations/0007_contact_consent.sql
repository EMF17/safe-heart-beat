ALTER TABLE public.pulse_accounts ADD COLUMN contact_confirmed_email text, ADD COLUMN contact_confirmed_at timestamptz, ADD COLUMN contact_confirm_sent_at timestamptz;
CREATE OR REPLACE FUNCTION public.pulse_overdue_accounts(_limit integer DEFAULT 100)
RETURNS TABLE(id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.id FROM public.pulse_accounts a
  WHERE a.last_checkin IS NOT NULL
    AND a.alert_state <> 'alerted'
    AND a.contact_confirmed_email IS NOT NULL
    AND lower(a.contact_confirmed_email) = lower(trim(a.contact_email))
    AND (a.paused_until IS NULL OR a.paused_until < now())
    AND a.last_checkin + make_interval(secs => (a.interval_ms * 2) / 1000.0) < now()
    AND a.last_checkin > now() - interval '30 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.pulse_alert_deliveries d
      WHERE d.account_id = a.id AND d.channel = 'email'
        AND d.checkin_key = 'missed-' || floor(extract(epoch FROM a.last_checkin) * 1000)::bigint::text
        AND NOT (d.status = 'failed' AND d.attempts < 5 AND (d.next_attempt_at IS NULL OR d.next_attempt_at <= now()))
        AND NOT (d.status = 'sending' AND d.attempts < 5 AND d.updated_at < now() - interval '15 minutes')
    )
  ORDER BY a.last_checkin
  LIMIT _limit;
$$;
REVOKE ALL ON FUNCTION public.pulse_overdue_accounts(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pulse_overdue_accounts(integer) TO service_role;