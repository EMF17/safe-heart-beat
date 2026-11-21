export type ChannelStatus = "sent" | "already_sent" | "not_connected" | "no_number" | "failed" | "sending";

export function getTestDeliveryState(status: unknown) {
  switch (status) {
    case "sent": return "accepted";
    case "already_sent": return "duplicate";
    case "sending": return "pending";
    case "not_connected": return "unavailable";
    case "no_number": return "missing_number";
    case "failed": return "failed";
    default: return "unknown";
  }
}

export function describeTestChannel(channel: "email" | "sms", status: unknown): string {
  const label = channel === "email" ? "Email" : "SMS";
  switch (getTestDeliveryState(status)) {
    case "accepted": return `${label} accepted for delivery. Ask your contact to confirm receipt; acceptance does not guarantee delivery.`;
    case "duplicate": return `${label} test already accepted today. A duplicate was not sent. You can test again after midnight UTC.`;
    case "pending": return `${label} request is already being processed. Delivery is not yet confirmed.`;
    case "unavailable": return `${label} service is not connected. Nothing was sent on this channel.`;
    case "missing_number": return "SMS was not sent because no contact phone number is saved online.";
    case "failed": return `${label} was not accepted. Check your connection and try again, or review Settings.`;
    default: return `${label} result could not be confirmed. Do not assume it was delivered.`;
  }
}