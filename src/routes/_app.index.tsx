import { createFileRoute } from "@tanstack/react-router";
import { PulseDashboard } from "@/components/PulseDashboard";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Pulse — Your quiet safety net" },
      {
        name: "description",
        content:
          "Pulse is a privacy-first safety check-in for people who live alone. One tap every 48 hours keeps your emergency contact informed.",
      },
      { property: "og:title", content: "Pulse — Your quiet safety net" },
      {
        property: "og:description",
        content:
          "A simple 'I'm Safe' button. No accounts, no tracking. If you miss two check-ins, we email your emergency contact.",
      },
    ],
  }),
});

function HomePage() {
  return <PulseDashboard />;
}
