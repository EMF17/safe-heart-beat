-- Run as a read-only query; six-calendar-month retention boundary tests.
SELECT 'six_month_boundary' AS rule,
  (timestamptz '2026-05-27 15:00:00+00' + interval '6 months' <= timestamptz '2026-11-27 15:00:00+00') AS passes
UNION ALL SELECT 'not_before_six_months',
  NOT (timestamptz '2026-05-27 15:00:01+00' + interval '6 months' <= timestamptz '2026-11-27 15:00:00+00')
UNION ALL SELECT 'vacation_pause_preserved',
  NOT (GREATEST(timestamptz '2026-01-01+00', timestamptz '2026-12-01+00') + interval '6 months' <= timestamptz '2026-11-27+00')
UNION ALL SELECT 'calendar_month_end',
  (timestamptz '2026-08-31+00' + interval '6 months' = timestamptz '2027-02-28+00');