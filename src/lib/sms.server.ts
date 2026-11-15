const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

export function smsConfigured() {
  return Boolean(process.env.LOVABLE_API_KEY && process.env.TWILIO_API_KEY);
}

export async function sendSms(to: string, text: string) {
  const gatewayKey = process.env.LOVABLE_API_KEY;
  const connectionKey = process.env.TWILIO_API_KEY;
  if (!gatewayKey || !connectionKey) return { status: "not_connected" as const };
  const headers = {
    Authorization: `Bearer ${gatewayKey}`,
    "X-Connection-Api-Key": connectionKey,
  };
  let from = process.env.TWILIO_FROM_NUMBER;
  if (!from) {
    const numbers = await fetch(`${GATEWAY_URL}/IncomingPhoneNumbers.json?PageSize=100`, { headers });
    if (!numbers.ok) {
      const body = await numbers.text();
      console.error(`Twilio sender lookup failed [${numbers.status}]: ${body}`);
      return { status: "failed" as const, error: "Twilio could not load your SMS sender number." };
    }
    const data = await numbers.json() as { incoming_phone_numbers?: { phone_number: string; capabilities?: { sms?: boolean } }[] };
    from = data.incoming_phone_numbers?.find((number) => number.capabilities?.sms)?.phone_number;
  }
  if (!from) return { status: "failed" as const, error: "Add an SMS-capable number to your Twilio account." };
  const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: to, From: from, Body: text }),
  });
  if (!response.ok) {
    const body = await response.text();
    console.error(`Twilio SMS failed [${response.status}]: ${body}`);
    return { status: "failed" as const, error: "Twilio did not accept the text message. Check your sender, destination permissions and account balance." };
  }
  return { status: "sent" as const };
}