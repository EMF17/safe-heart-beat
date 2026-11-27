import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Pulse" },
      { name: "description", content: "How Pulse stores contact details, check-ins and alert settings online for server-side alerts, with optional recovery and AI checklist consent." },
      { property: "og:title", content: "Privacy Policy — Pulse" },
      { property: "og:description", content: "Online safety records are required for Pulse alerts. Learn about stored data, optional recovery, AI consent and deletion." },
      { property: "og:type", content: "website" }, { property: "og:url", content: "https://pulse-checkin.app/privacy-policy" }, { property: "og:image", content: "https://pulse-checkin.app/og-image.png" }, { name: "twitter:image", content: "https://pulse-checkin.app/og-image.png" }, { name: "twitter:title", content: "Privacy Policy — Pulse" }, { name: "twitter:description", content: "Online safety records are required for Pulse alerts. Learn about stored data, optional recovery, AI consent and deletion." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A1929" }}>
      <div className="max-w-lg mx-auto px-6 py-8 text-white">
        {/* Back button */}
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>

        <h1 className="font-display text-3xl font-semibold mb-2">
          Privacy Policy for Pulse
        </h1>
        <p className="text-sm text-white/60 mb-10">
          Last updated: November 27, 2026
        </p>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Overview</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Pulse is a safety check-in app designed to email an emergency contact if you miss your check-ins. There is no account sign-up or password. Visits are counted anonymously without cookies. Saving a contact creates an online safety record containing personal data, including contact details, check-ins and alert settings. This online storage is required for server-side alerts, happens before any alert and does not depend on enabling a Sync Code or passkey. A copy is also kept on your device. Recovery on another device is optional; online storage for alerts is not. The optional AI checklist sends your description and region for processing only with your explicit consent. Email delivery is not guaranteed.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Data Stored on Your Device</h2>
          <ul className="space-y-3 text-sm text-white/80 leading-relaxed">
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Contact details:</strong> Your emergency contact&apos;s name, email and optional phone number, and the optional name you enter.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Check-in history:</strong> Times you tapped “I’m OK”.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Settings:</strong> Check-in interval, vacation dates, reminder preferences and your chosen travel region.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Safety checklist:</strong> Any AI-generated checklist and which items you ticked off.</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Data Stored on Our Servers</h2>
          <ul className="space-y-3 text-sm text-white/80 leading-relaxed">
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Online safety record (required for alerts):</strong> When you save a contact, we create an online record under a random ID so our server can alert them if you miss check-ins. It contains your contact&apos;s name, email and optional phone, your optional name, latest check-in time, up to 500 check-ins, your check-in interval, any pause dates and your region code for emergency numbers. This is personal data, not anonymous data, and is stored before any alert, whether or not you enable recovery. Our server checks it every hour and can send alerts even if your phone is off, once your contact has confirmed. Email delivery is not guaranteed. You can delete the safety record in Settings; doing so also stops server-side monitoring for that record.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Recovery credentials (optional):</strong> A Sync Code or passkey lets another device retrieve your existing online safety record; it does not enable online storage or monitoring. Only a one-way fingerprint of the code is stored on our servers. Every code expires: you choose 1 hour, 24 hours, 7 days or 30 days. Repeated wrong guesses are temporarily blocked. Expired codes cannot restore data; expiry does not delete the safety record or stop server-side monitoring. Passkey recovery stores public credential information, not your private passkey.</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">How We Use Your Data</h2>
          <ul className="space-y-3 text-sm text-white/80 leading-relaxed">
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span>Your emergency contact&apos;s email is used to request their confirmation and to send missed-check-in alerts and test alerts after they confirm. Pulse alerts are email-only; delivery is not guaranteed. A phone number saved in an earlier version may remain in the online safety record until that record is deleted, but Pulse no longer offers phone-number setup.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span>Alerts include emergency phone numbers for your region. Your region is guessed on your device from its language and time zone settings (or the travel region you pick) — we never use GPS.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span>Check-in history is used to show your past check-ins and decide when an alert is due.</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Camera (QR Scanning)</h2>
          <ul className="space-y-3 text-sm text-white/80 leading-relaxed">
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span>If you choose &quot;Scan a QR code&quot;, Pulse asks for camera access only to read the sync code. Scanning happens entirely on your device; no images or video are saved or sent anywhere. The camera turns off when you leave the scanner.</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">AI Safety Checklist</h2>
          <ul className="space-y-3 text-sm text-white/80 leading-relaxed">
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span>If you use the personal safety checklist, the living-situation description and region you type pass through Pulse&apos;s server to Lovable AI and its model provider to create your checklist, before any alert. Pulse does not save that text in your safety record or checklist database. Provider processing and operational logs are separate from visit counting; we do not promise that providers retain nothing. The finished checklist is saved on your device.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span>Please don&apos;t include names, addresses or other identifying details. AI suggestions are general guidance, not professional advice.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Your consent:</strong> Nothing is sent until you tick an unticked consent box next to the button, every time you create a checklist. Because your description may include health information, we rely on your explicit consent (GDPR Articles 6(1)(a) and 9(2)(a)). The checklist is optional and the rest of Pulse works without it. You can withdraw consent at any time by not using the checklist; withdrawal doesn&apos;t affect checklists already created. Your text may be processed outside your country by the AI model provider.</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Third-Party Services</h2>
          <ul className="space-y-3 text-sm text-white/80 leading-relaxed">
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span>
                <strong>Resend (resend.com):</strong> Delivers contact-confirmation emails, missed-check-in alerts and test alerts. When sending one of these emails, our server looks up the saved contact&apos;s email and passes it with Pulse&apos;s fixed message to Resend. See{" "}
                <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" className="underline text-white/90 hover:text-white">
                  Resend&apos;s privacy policy
                </a>
                .
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Lovable Cloud:</strong> Hosts the app and stores your online safety record when you save a contact, regardless of whether recovery is enabled. This storage is required for server-side alerts. Hosting and service operation may involve technical logs; these are separate from visit counting.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Visit counting (Lovable):</strong> Pulse counts visits using Lovable&apos;s analytics. It uses no cookies, stores nothing on your device, doesn&apos;t keep IP addresses and doesn&apos;t identify you. It records the pages visited, where visitors came from, country, browser, operating system and device type, how long visits last, page speed, errors, and which buttons and links are clicked. This is recorded for every visitor. Detailed data is kept for 90 days and daily summaries for a year. Lovable collects this data for us. <a href="https://lovable.dev/privacy" target="_blank" rel="noopener noreferrer" className="underline text-white/90 hover:text-white">Lovable&apos;s privacy policy</a> explains how it handles it.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Lovable AI:</strong> Processes your description and region with its model provider for the optional checklist. See <a href="https://lovable.dev/privacy" target="_blank" rel="noopener noreferrer" className="underline text-white/90 hover:text-white">Lovable&apos;s privacy policy</a> for how Lovable handles data.</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">What We DO NOT Collect</h2>
          <ul className="space-y-2 text-sm text-white/80 leading-relaxed">
            <li className="flex items-center gap-2">
              <span className="shrink-0 text-red-400">❌</span>
              <span>No GPS or precise location</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="shrink-0 text-red-400">❌</span>
              <span>No advertising IDs; your online safety record uses a random ID, but its contents are personal data</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="shrink-0 text-red-400">❌</span>
              <span>No cookies, cross-site tracking or advertising profiles</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="shrink-0 text-red-400">❌</span>
              <span>No account, email sign-up or password</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="shrink-0 text-red-400">❌</span>
              <span>No camera images</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Your Control Over Data</h2>
          <ul className="space-y-3 text-sm text-white/80 leading-relaxed">
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Delete my data:</strong> Settings → Delete my data permanently deletes your online safety record, check-ins, contact details, recovery credentials and related alert and confirmation receipts, then removes Pulse data from this device. If online deletion fails, device data is kept so you can try again. Monitoring stops after deletion. Copies already on another device, sent emails, hosting backups and providers&apos; operational logs are not remotely erased by this button.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Turn off sync code:</strong> Settings → Sync Code → Turn off makes your code stop working immediately. This does not delete the online safety record, stop server-side monitoring or stop an already connected device from updating it. Use Delete All Data to remove the safety record and stop its monitoring.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Uninstall or clear browser data:</strong> Removes everything stored on your device. To also remove server data, use Delete my data first, or email us.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Inactive records:</strong> Online safety records are deleted after six calendar months without a check-in, or six months after creation if there was no check-in. A saved vacation pause extends this until six months after the pause ends. Cleanup runs daily, so deletion may take up to an additional day. Deletion stops monitoring and recovery for that record.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Contact opt-outs:</strong> Every alert email includes a signed link to stop all Pulse emails to that address. Opt-out addresses are retained separately to honour that request even after a safety record is deleted.</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Data Security</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            All connections are encrypted. Server data is locked so only Pulse&apos;s own server code can read it. Device tokens and email check-in links are cryptographically signed, not saved as raw tokens in the safety database, and requests are limited using one-way fingerprints of the token and connection address. Sync codes are stored only as one-way fingerprints. The device keeps its bearer token locally to prove ownership; anyone who obtains it may access the record until it expires or the record is deleted.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Children&apos;s Privacy</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Pulse is not intended for children under 13. We do not knowingly collect information from children.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Changes to This Policy</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            If we update this policy, the &quot;Last updated&quot; date will change. Continued use of the app means you accept the updated policy.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold mb-3">Contact Us</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            For privacy questions or to request deletion of your online data, contact:{" "}
            <a
              href="mailto:pulse.safety.fin@gmail.com"
              className="underline text-white/90 hover:text-white"
            >
              pulse.safety.fin@gmail.com
            </a>
          </p>
        </section>

        {/* Bottom back button */}
        <Link
          to="/settings"
          className="inline-flex items-center justify-center w-full h-11 rounded-full border-2 border-white/30 text-white font-medium text-sm hover:bg-white/10 active:scale-[0.98] transition mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Settings
        </Link>
      </div>
    </div>
  );
}
