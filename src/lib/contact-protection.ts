export interface ContactProtection {
  email: string;
  confirmed: boolean;
  bounced: boolean;
  blocked: boolean;
  requestSentAt: string | null;
  resendAt: string | null;
}

export function latestContactEmailBounced(receipts: { status: string; created_at: string }[]): boolean {
  const latest = receipts.filter(r => r.status === "bounced" || r.status === "delivered")
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0];
  return latest?.status === "bounced";
}

export const CONFIRMATION_RECIPIENT_GAP_MS = 24 * 3600_000;
export function confirmationResendAt(sentAt: string | null): string | null {
  return sentAt ? new Date(Date.parse(sentAt) + CONFIRMATION_RECIPIENT_GAP_MS).toISOString() : null;
}