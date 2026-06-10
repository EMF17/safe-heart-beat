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
          Last updated: June 10, 2026
        </p>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Overview</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Pulse is a safety check-in app designed to alert an emergency contact if you miss two consecutive check-ins. Your privacy is our priority.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Data We Collect</h2>
          <ul className="space-y-3 text-sm text-white/80 leading-relaxed">
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Emergency contact name and email address:</strong> You voluntarily provide this information. It is stored only on your device.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Check-in history:</strong> Timestamps of when you tap the &quot;I&apos;m Safe&quot; button. Stored only on your device.</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">How We Use Your Data</h2>
          <ul className="space-y-3 text-sm text-white/80 leading-relaxed">
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span>Your emergency contact email is used only to send automated safety alerts if you miss two check-ins (96 hours).</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span>Check-in history is used only to display your streak and determine when to send alerts.</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Third-Party Services</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            <span className="shrink-0">·</span>{" "}
            <strong>Resend (resend.com):</strong> Used to send email alerts. Your emergency contact email is transmitted to Resend only when an alert is triggered. Resend does not store email addresses or content longer than necessary to deliver the alert, and we have no access to those logs. See{" "}
            <a
              href="https://resend.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-white/90 hover:text-white"
            >
              Resend&apos;s privacy policy
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">What We DO NOT Collect</h2>
          <ul className="space-y-2 text-sm text-white/80 leading-relaxed">
            <li className="flex items-center gap-2">
              <span className="shrink-0 text-red-400">❌</span>
              <span>No location data</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="shrink-0 text-red-400">❌</span>
              <span>No device identifiers</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="shrink-0 text-red-400">❌</span>
              <span>No usage analytics</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="shrink-0 text-red-400">❌</span>
              <span>No advertising IDs</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="shrink-0 text-red-400">❌</span>
              <span>No account or password</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Your Control Over Data</h2>
          <ul className="space-y-3 text-sm text-white/80 leading-relaxed">
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Delete all data:</strong> Go to Settings → Delete All Data. This removes all check-in history and your emergency contact.</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">·</span>
              <span><strong>Uninstall the app:</strong> All data stored on your device is removed.</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">Data Security</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            All data remains on your device. No data is stored on our servers. Email alerts are sent via Resend using industry-standard encryption.
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
