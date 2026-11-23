CREATE TABLE public.pulse_email_suppressions (
  email_lower text PRIMARY KEY,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.pulse_email_suppressions TO service_role;
ALTER TABLE public.pulse_email_suppressions ENABLE ROW LEVEL SECURITY;