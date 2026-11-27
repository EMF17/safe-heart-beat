CREATE OR REPLACE FUNCTION public.pulse_delete_account(_account_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.pulse_grace_reminders WHERE account_id = _account_id;
  DELETE FROM public.pulse_accounts WHERE id = _account_id;
  RETURN FOUND;
END;
$$;
REVOKE ALL ON FUNCTION public.pulse_delete_account(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pulse_delete_account(uuid) TO service_role;