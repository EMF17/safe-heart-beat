import { createFileRoute } from "@tanstack/react-router";

const page = (msg: string, form = "") => new Response(
  `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pulse safety contact</title><body style="font-family:system-ui;max-width:480px;margin:48px auto;padding:0 16px;line-height:1.5"><h1 style="font-size:20px">Pulse safety contact</h1><p>${msg}</p>${form}</body>`,
  { headers: { "Content-Type": "text/html; charset=utf-8" } });

function params(url: URL) {
  return { a: (url.searchParams.get("a") ?? "").slice(0, 40), e: (url.searchParams.get("e") ?? "").slice(0, 320), s: (url.searchParams.get("s") ?? "").slice(0, 64) };
}
async function valid(url: URL) {
  const p = params(url);
  if (!/^[0-9a-f-]{36}$/i.test(p.a) || !p.e || !p.s) return null;
  const { verifyConsent } = await import("@/lib/contact-consent.server");
  return verifyConsent(p.a, p.e, p.s) ? p : null;
}

// Signed link from the consent email. GET only shows a button so mail
// scanners can't confirm on someone's behalf; POST records consent.
export const Route = createFileRoute("/api/public/confirm-contact")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        if (!(await valid(url))) return page("This link is not valid.");
        return page("Agree to receive Pulse alerts if this person misses two check-ins in a row? You can stop all Pulse emails at any time from the link in any alert.",
          `<form method="post" action="${url.pathname}${url.search.replace(/"/g, "")}"><button style="padding:10px 16px;font-size:16px">Yes, I'm their safety contact</button></form>`);
      },
      POST: async ({ request }) => {
        const p = await valid(new URL(request.url));
        if (!p) return page("This link is not valid.");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: a } = await supabaseAdmin.from("pulse_accounts").select("contact_email").eq("id", p.a).maybeSingle();
        if (!a || a.contact_email.trim().toLowerCase() !== p.e) return page("This request is no longer active — the contact address was changed.");
        await supabaseAdmin.from("pulse_accounts").update({ contact_confirmed_email: p.e, contact_confirmed_at: new Date().toISOString() }).eq("id", p.a);
        return page("Thank you — you're confirmed. Pulse will only email you if they miss two check-ins in a row.");
      },
    },
  },
});
