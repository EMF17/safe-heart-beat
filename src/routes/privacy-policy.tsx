import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Pulse" },
      { name: "description", content: "Pulse privacy policy." },
      { property: "og:title", content: "Privacy Policy — Pulse" },
      { property: "og:description", content: "How Pulse handles check-in data, recovery codes, and safety plans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
          Last updated: November 12, 2026
        </p>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Overview</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Pulse is a safety check-in app designed to email an emergency contact if you miss your check-ins. There is no account sign-up or password. Visits are counted anonymously without cookies. Contact details and check-ins are stored on your device; enabling online recovery creates a server backup before any alert. The optional AI checklist also sends your description and region for processing. We do not promise that nothing leaves your device until an alert.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Data Stored on Your Device</h2>
          <ul className="space-y-3 text-sm text-white/80 leading-relaxed">
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Contact details:</strong> Your emergency contact&apos;s name and email, and the optional name you enter.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Check-in history:</strong> Times you tapped &quot;I&apos;m Safe&quot;.</span>
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
              <span><strong>Online recovery and alert record:</strong> Saving a contact alone stores it on your device. If you enable a Sync Code or passkey, we create an online record under a random ID. It contains your contact&apos;s name and email, your optional name, latest check-in time and up to 500 check-ins, and updates while recovery is enabled. This is personal data, not anonymous data, and is stored before an alert. Alerts use this record; the current app must be open and connected to request them. Alerts while your phone is off are not guaranteed.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Recovery credentials (optional):</strong> A Sync Code lets another device retrieve your online backup. Only a one-way fingerprint of the code is stored on our servers. You can choose an expiry of 1 hour, 24 hours, 7 days or 30 days, or no expiry. Expired codes cannot restore data; expiry does not delete the backup. Passkey recovery stores public credential information, not your private passkey.</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">How We Use Your Data</h2>
          <ul className="space-y-3 text-sm text-white/80 leading-relaxed">
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span>Your emergency contact&apos;s email is used only to send a safety alert when you miss your check-ins, and test alerts you send yourself.</span>
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
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Third-Party Services</h2>
          <ul className="space-y-3 text-sm text-white/80 leading-relaxed">
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span>
                <strong>Resend (resend.com):</strong> Delivers alert emails. Your contact&apos;s email and the alert message are passed to Resend only when an alert is sent. See{" "}
                <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" className="underline text-white/90 hover:text-white">
                  Resend&apos;s privacy policy
                </a>
                .
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Lovable Cloud:</strong> Hosts the app and stores your online recovery and alert record when enabled. Hosting and service operation may involve technical logs; these are separate from visit counting.</span>
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
              <span>No advertising IDs; online recovery uses a random record ID and recovery credentials</span>
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
              <span><strong>Delete all data:</strong> Settings → Delete All Data removes everything on your device and permanently deletes your safety record (contact, check-ins and sync code) from our servers.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Turn off sync code:</strong> Settings → Sync Code → Turn off makes your code stop working immediately. This does not delete the online backup or stop an already connected device from updating it. Use Delete All Data to request removal of the online record.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Uninstall or clear browser data:</strong> Removes everything stored on your device. To also remove server data, use Delete All Data first, or email us.</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Data Security</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            All connections are encrypted. Server data is locked so only Pulse&apos;s own server code can read it, and your device proves its identity with a signed secret token. Sync codes are stored only as one-way fingerprints.
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
