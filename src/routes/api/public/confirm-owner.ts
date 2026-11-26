import { createFileRoute } from "@tanstack/react-router";

const page = (msg: string, form = "") => new Response(
  `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pulse reminders</title><body style="font-family:system-ui;max-width:480px;margin:48px auto;padding:0 16px;line-height:1.5"><h1 style="font-size:20px">Pulse reminders</h1><p>${msg}</p>${form}</body>`,
  { headers: { "Content-Type": "text/html; charset=utf-8" } });
async function valid(url: URL) {
  const a = (url.searchParams.get("a") ?? "").slice(0, 40), e = (url.searchParams.get("e") ?? "").slice(0, 320), s = (url.searchParams.get("s") ?? "").slice(0, 64);
  if (!/^[0-9a-f-]{36}$/i.test(a) || !e || !s) return null;
  const { verifyOwner } = await import("@/lib/grace.server");
  return verifyOwner(a, e, s) ? { a, e } : null;
}
// GET shows a button only, so mail scanners can't confirm; POST records it.
export const Route = createFileRoute("/api/public/confirm-owner")({
  server: { handlers: {
    GET: async ({ request }) => {
      const url = new URL(request.url);
      if (!(await valid(url))) return page("This link is not valid.");
      return page("Get an \"Are you OK?\" email at this address if you miss a check-in?",
        `<form method="post" action="${url.pathname}${url.search.replace(/"/g, "")}"><button style="padding:10px 16px;font-size:16px">Yes, confirm my email</button></form>`);
    },
    POST: async ({ request }) => {
      const p = await valid(new URL(request.url));
      if (!p) return page("This link is not valid.");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data } = await supabaseAdmin.from("pulse_accounts").select("owner_email").eq("id", p.a).maybeSingle();
      if (!data?.owner_email || data.owner_email.trim().toLowerCase() !== p.e) return page("This request is no longer active — the email was changed.");
      await supabaseAdmin.from("pulse_accounts").update({ owner_confirmed_email: p.e }).eq("id", p.a);
      return page("Confirmed. If you miss a check-in, Pulse will email you before alerting your contact.");
    },
  } },
});
