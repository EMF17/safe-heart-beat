import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Pulse" },
      { name: "description", content: "Pulse privacy policy." },
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
          Last updated: October 17, 2026
        </p>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Overview</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Pulse is a safety check-in app that alerts an emergency contact if you miss your check-ins. There is no account, email sign-up or password. We keep as little data as possible, and most of it stays on your device.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Data Stored on Your Device</h2>
          <ul className="space-y-3 text-sm text-white/80 leading-relaxed">
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
              <span><strong>Anonymous safety record:</strong> When you save an emergency contact, we create a record with a random ID (not linked to your name, phone or device). It holds your contact&apos;s name and email, the optional name you entered, and your latest check-in time, so alerts can be sent even if your phone is off or lost.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Sync code backup (optional):</strong> If you create a sync code, your check-in history (up to 500 entries) is also stored so you can restore it on a new device. The code itself is never stored — only a one-way scrambled fingerprint, so we cannot read or recover it. You can choose for the code to expire automatically (1 hour to 30 days); expired codes stop working and are cleared.</span>
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
              <span>Check-in history is used to show your streaks and decide when an alert is due.</span>
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
              <span>If you use the personal safety checklist, the living-situation description and region you type are sent to our AI provider (via Lovable AI) to create your checklist. This text is not linked to your safety record, and we don&apos;t store it on our servers. The finished checklist is saved only on your device.</span>
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
              <span><strong>Lovable Cloud:</strong> Hosts the app and the secure database that holds your anonymous safety record.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Lovable AI:</strong> Generates the optional safety checklist from the text you provide.</span>
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
              <span>No device identifiers or advertising IDs</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="shrink-0 text-red-400">❌</span>
              <span>No usage analytics or tracking</span>
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
              <span><strong>Turn off sync code:</strong> Settings → Sync Code → Turn off makes your code stop working immediately.</span>
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
            For privacy questions or to request data deletion (though we store nothing server-side), contact:{" "}
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
