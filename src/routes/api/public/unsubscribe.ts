import { createFileRoute } from "@tanstack/react-router";

const page = (msg: string, form = "") => new Response(
  `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pulse emails</title><body style="font-family:system-ui;max-width:480px;margin:48px auto;padding:0 16px;line-height:1.5"><h1 style="font-size:20px">Pulse Safety emails</h1><p>${msg}</p>${form}</body>`,
  { headers: { "Content-Type": "text/html; charset=utf-8" } });

async function check(url: URL) {
  const e = (url.searchParams.get("e") ?? "").slice(0, 320);
  const s = (url.searchParams.get("s") ?? "").slice(0, 64);
  const { verifyUnsubscribe } = await import("@/lib/email-suppression.server");
  return e && s && verifyUnsubscribe(e, s) ? e : null;
}

// Signed per-address link in every alert email. GET only shows a button (so
// mail scanners can't opt people out); POST records the opt-out.
export const Route = createFileRoute("/api/public/unsubscribe")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        if (!(await check(url))) return page("This link is not valid.");
        return page("Stop all Pulse emails to this address, including future safety alerts? Whoever listed you as their contact will no longer be able to reach you through Pulse.",
          `<form method="post" action="${url.pathname}${url.search.replace(/"/g, "")}"><button style="padding:10px 16px;font-size:16px">Stop Pulse emails</button></form>`);
      },
      POST: async ({ request }) => {
        const email = await check(new URL(request.url));
        if (!email) return page("This link is not valid.");
        const { suppress } = await import("@/lib/email-suppression.server");
        await suppress(email, "unsubscribe");
        return page("Done. Pulse will not email this address again.");
      },
    },
  },
});
