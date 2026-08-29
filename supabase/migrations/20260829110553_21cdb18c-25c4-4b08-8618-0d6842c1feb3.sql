ALTER TABLE public.pulse_accounts
  ADD COLUMN IF NOT EXISTS checkins jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recovery_code_hash text,
  ADD COLUMN IF NOT EXISTS recovery_code_created_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS pulse_accounts_recovery_code_hash_key
  ON public.pulse_accounts (recovery_code_hash)
  WHERE recovery_code_hash IS NOT NULL;