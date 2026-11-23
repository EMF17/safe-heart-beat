- Native iOS/Android apps use Capacitor (capacitor.config.ts) as a shell loading the live site URL; why: SSR + server functions can't run from a static bundle.
- Keep native platform source in ios/ and android/ and sync with Capacitor; why: device builds need persistent camera permissions, icons, and offline fallback settings.
- Derive browser, home-screen, and store icons from the configured iOS app icon; keep native/store icons local because platform packaging and submission require image files.
- SMS delivery uses the server-only Twilio gateway and the signed recovery token; persist separate email/SMS receipts so retrying one channel does not repeat the other.
- Keep the daily dashboard focused on check-in confirmation and the next due time, using usePulse for timing and persistence; optional recovery and safety-plan tools belong on their existing separate screens.
- Keep the Chinese picture guide on the Chinese information page and use actual phone-screen assets with translated captions; why: readers can match the English check-in controls without adding distractions to the daily screen.

- Missed-check-in alerts are sent only by the hourly server sweep (/api/public/cron/overdue-alerts → pulse_overdue_accounts → alert.server.ts); clients just post check-ins and settings. Why: alerts must work when the phone is off or the app is closed.
