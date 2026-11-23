ALTER TABLE public.pulse_accounts
  ADD COLUMN IF NOT EXISTS interval_ms bigint NOT NULL DEFAULT 172800000,
  ADD COLUMN IF NOT EXISTS paused_until timestamptz,
  ADD COLUMN IF NOT EXISTS country_code text;

CREATE OR REPLACE FUNCTION public.pulse_overdue_accounts(_limit integer DEFAULT 100)
RETURNS TABLE(id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.id FROM public.pulse_accounts a
  WHERE a.last_checkin IS NOT NULL
    AND (a.paused_until IS NULL OR a.paused_until < now())
    AND a.last_checkin + make_interval(secs => (a.interval_ms * 2) / 1000.0) < now()
    AND a.last_checkin > now() - interval '30 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.pulse_alert_deliveries d
      WHERE d.account_id = a.id AND d.channel = 'email'
        AND d.checkin_key = to_char(a.last_checkin AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    )
  ORDER BY a.last_checkin
  LIMIT _limit;
$$;
REVOKE ALL ON FUNCTION public.pulse_overdue_accounts(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pulse_overdue_accounts(integer) TO service_role;