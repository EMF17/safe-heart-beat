CREATE TABLE public.pulse_rate_limits (
  bucket text NOT NULL,
  window_start timestamptz NOT NULL,
  hits integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, window_start)
);
GRANT ALL ON public.pulse_rate_limits TO service_role;
ALTER TABLE public.pulse_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.pulse_rate_hit(_bucket text, _limit integer, _window_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _start timestamptz := to_timestamp(floor(extract(epoch FROM now()) / _window_seconds) * _window_seconds);
        _hits integer;
BEGIN
  INSERT INTO public.pulse_rate_limits(bucket, window_start, hits) VALUES (_bucket, _start, 1)
  ON CONFLICT (bucket, window_start) DO UPDATE SET hits = pulse_rate_limits.hits + 1
  RETURNING hits INTO _hits;
  DELETE FROM public.pulse_rate_limits WHERE window_start < now() - interval '2 days' AND random() < 0.01;
  RETURN _hits <= _limit;
END $$;
REVOKE ALL ON FUNCTION public.pulse_rate_hit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pulse_rate_hit(text, integer, integer) TO service_role;