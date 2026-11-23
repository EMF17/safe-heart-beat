import { createFileRoute } from "@tanstack/react-router";

interface AlertPayload {
  token?: string;
  type?: "test" | "missed";
  countryCode?: string;
}

export const Route = createFileRoute("/api/send-alert")({
  server: {
    handlers: {
      POST: async ({ request }) => {

        let body: AlertPayload;
        try {
          body = (await request.json()) as AlertPayload;
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const token = (body.token ?? "").trim();
        if (!token) {
          return Response.json(
            { error: "Authentication required" },
            { status: 401 }
          );
        }

        // Verify the caller's HMAC token and resolve their account.
        // Both modules are server-only; import inside the handler so they
        // never ship into the client bundle.
        const { verifyToken } = await import("@/lib/sync.server");

        let accountId: string;
        try {
          accountId = await verifyToken(token);
        } catch {
          return Response.json(
            { error: "Invalid or expired token" },
            { status: 401 }
          );
        }

        if (body.type !== "test") {
          return Response.json(
            { error: "Missed check-in alerts are sent automatically by the server." },
            { status: 400 }
          );
        }
        const { sendAccountAlert } = await import("@/lib/alert.server");
        return sendAccountAlert(accountId, "test", body.countryCode ?? null);
      },
    },
  },
});
