import { createFileRoute } from "@tanstack/react-router";

const page = (msg: string, form = "") => new Response(
  `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pulse check-in</title><body style="font-family:system-ui;max-width:480px;margin:48px auto;padding:0 16px;line-height:1.5;font-size:17px"><h1 style="font-size:22px">Pulse check-in</h1><p>${msg}</p>${form}</body>`,
  { headers: { "Content-Type": "text/html; charset=utf-8" } });
async function valid(url: URL) {
  const a = (url.searchParams.get("a") ?? "").slice(0, 40), t = Number(url.searchParams.get("t")), s = (url.searchParams.get("s") ?? "").slice(0, 64);
  if (!/^[0-9a-f-]{36}$/i.test(a) || !Number.isFinite(t) || !s) return null;
  const { verifyCheckin } = await import("@/lib/grace.server");
  return verifyCheckin(a, t, s) ? { a, t } : null;
}
// Link from the "Are you OK?" email. Bound to one missed cycle; GET shows a
// button only (mail scanners must not check someone in), POST checks in.
export const Route = createFileRoute("/api/public/checkin-link")({
  server: { handlers: {
    GET: async ({ request }) => {
      const url = new URL(request.url);
      if (!(await valid(url))) return page("This link is not valid.");
      return page("Tap the button to tell Pulse you're OK. Your contact will not be alerted for this missed check-in.",
        `<form method="post" action="${url.pathname}${url.search.replace(/"/g, "")}"><button style="padding:14px 22px;font-size:18px">I'm OK</button></form>`);
    },
    POST: async ({ request }) => {
      const p = await valid(new URL(request.url));
      if (!p) return page("This link is not valid.");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data } = await supabaseAdmin.from("pulse_accounts").select("last_checkin, checkins").eq("id", p.a).maybeSingle();
      if (!data?.last_checkin || Math.floor(new Date(data.last_checkin).getTime()) !== p.t) return page("You've already checked in since this email. You're all set.");
      const at = new Date().toISOString();
      const hist = Array.isArray(data.checkins) ? (data.checkins as unknown[]).filter((v): v is string => typeof v === "string") : [];
      const { error } = await supabaseAdmin.from("pulse_accounts").update({ last_checkin: at, checkins: [...hist, at].slice(-500) })
        .eq("id", p.a).eq("last_checkin", data.last_checkin);
      if (error) return page("Something went wrong. Please open the Pulse app and tap I'm OK.");
      return page("Thanks — you're checked in. Your contact will not be alerted.");
    },
  } },
});
