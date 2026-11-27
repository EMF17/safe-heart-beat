CREATE OR REPLACE FUNCTION public.pulse_cleanup_inactive_accounts()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE victim uuid; removed integer := 0;
BEGIN
  FOR victim IN
    SELECT id FROM public.pulse_accounts
    WHERE GREATEST(COALESCE(last_checkin, created_at), COALESCE(paused_until, created_at)) + interval '6 months' <= now()
    ORDER BY id FOR UPDATE SKIP LOCKED
  LOOP
    IF public.pulse_delete_account(victim) THEN removed := removed + 1; END IF;
  END LOOP;
  RETURN removed;
END;
$$;
REVOKE ALL ON FUNCTION public.pulse_cleanup_inactive_accounts() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pulse_cleanup_inactive_accounts() TO service_role;