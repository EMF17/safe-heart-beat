// Server-only helpers for passkey-based sync. Never import from client code.
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import { createHmac, timingSafeEqual } from "crypto";

import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const RP_NAME = "Pulse";
export const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year

function getSecret(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return key;
}

export function originToRpId(origin: string): string {
  const url = new URL(origin);
  return url.hostname;
}

// --- HMAC bearer token: `${accountId}.${expiresAt}.${hmac}` ---

export function issueToken(accountId: string): string {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const payload = `${accountId}.${exp}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): string {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token");
  const [accountId, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) {
    throw new Error("Token expired");
  }
  const expected = createHmac("sha256", getSecret())
    .update(`${accountId}.${expStr}`)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid token signature");
  }
  return accountId;
}

// --- Registration ---

export async function startRegistration(args: {
  origin: string;
  accountId?: string | null;
  contactEmail?: string;
}) {
  const rpID = originToRpId(args.origin);
  let accountId = args.accountId ?? null;

  if (!accountId) {
    if (!args.contactEmail) throw new Error("Contact email required to create account");
    const { data, error } = await supabaseAdmin
      .from("pulse_accounts")
      .insert({ contact_email: args.contactEmail })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    accountId = data.id;
  }

  // Exclude already-registered credentials so user doesn't register the same authenticator twice
  const { data: existing } = await supabaseAdmin
    .from("pulse_passkeys")
    .select("credential_id, transports")
    .eq("account_id", accountId);

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID,
    userID: new TextEncoder().encode(accountId),
    userName: `pulse-${accountId.slice(0, 8)}`,
    userDisplayName: "Pulse account",
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },
    excludeCredentials: (existing ?? []).map((c) => ({
      id: c.credential_id,
      transports: (c.transports ?? []) as AuthenticatorTransport[],
    })),
  });

  const { data: ch, error: chErr } = await supabaseAdmin
    .from("pulse_challenges")
    .insert({
      challenge: options.challenge,
      kind: "register",
      account_id: accountId,
      rp_id: rpID,
      origin: args.origin,
    })
    .select("id")
    .single();
  if (chErr) throw new Error(chErr.message);

  return { options, accountId, challengeId: ch.id };
}

export async function finishRegistration(args: {
  origin: string;
  challengeId: string;
  response: RegistrationResponseJSON;
}) {
  const { data: ch, error: chErr } = await supabaseAdmin
    .from("pulse_challenges")
    .select("*")
    .eq("id", args.challengeId)
    .single();
  if (chErr || !ch) throw new Error("Challenge not found");
  if (ch.kind !== "register") throw new Error("Wrong challenge kind");
  if (new Date(ch.expires_at).getTime() < Date.now()) throw new Error("Challenge expired");
  if (!ch.account_id) throw new Error("Challenge missing account");

  const verification = await verifyRegistrationResponse({
    response: args.response,
    expectedChallenge: ch.challenge,
    expectedOrigin: ch.origin,
    expectedRPID: ch.rp_id,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error("Registration not verified");
  }

  const { credential } = verification.registrationInfo;
  const publicKeyB64 = Buffer.from(credential.publicKey).toString("base64");

  const { error: insErr } = await supabaseAdmin.from("pulse_passkeys").insert({
    account_id: ch.account_id,
    credential_id: credential.id,
    public_key: publicKeyB64,
    counter: credential.counter,
    transports: (credential.transports ?? []) as string[],
  });
  if (insErr) throw new Error(insErr.message);

  await supabaseAdmin.from("pulse_challenges").delete().eq("id", ch.id);

  const token = issueToken(ch.account_id);
  return { token, accountId: ch.account_id };
}

// --- Authentication (restore) ---

export async function startAuthentication(args: { origin: string }) {
  const rpID = originToRpId(args.origin);
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    // Empty allowCredentials = discoverable credential flow; the authenticator
    // picks which account-bound passkey to use.
    allowCredentials: [],
  });

  const { data: ch, error: chErr } = await supabaseAdmin
    .from("pulse_challenges")
    .insert({
      challenge: options.challenge,
      kind: "authenticate",
      account_id: null,
      rp_id: rpID,
      origin: args.origin,
    })
    .select("id")
    .single();
  if (chErr) throw new Error(chErr.message);

  return { options, challengeId: ch.id };
}

export async function finishAuthentication(args: {
  origin: string;
  challengeId: string;
  response: AuthenticationResponseJSON;
}) {
  const { data: ch, error: chErr } = await supabaseAdmin
    .from("pulse_challenges")
    .select("*")
    .eq("id", args.challengeId)
    .single();
  if (chErr || !ch) throw new Error("Challenge not found");
  if (ch.kind !== "authenticate") throw new Error("Wrong challenge kind");
  if (new Date(ch.expires_at).getTime() < Date.now()) throw new Error("Challenge expired");

  const credentialId = args.response.id;
  const { data: pk, error: pkErr } = await supabaseAdmin
    .from("pulse_passkeys")
    .select("*")
    .eq("credential_id", credentialId)
    .single();
  if (pkErr || !pk) throw new Error("Unknown passkey");

  const verification = await verifyAuthenticationResponse({
    response: args.response,
    expectedChallenge: ch.challenge,
    expectedOrigin: ch.origin,
    expectedRPID: ch.rp_id,
    credential: {
      id: pk.credential_id,
      publicKey: new Uint8Array(Buffer.from(pk.public_key, "base64")),
      counter: Number(pk.counter),
      transports: (pk.transports ?? []) as AuthenticatorTransport[],
    },
  });

  if (!verification.verified) throw new Error("Authentication not verified");

  // Bump counter
  await supabaseAdmin
    .from("pulse_passkeys")
    .update({ counter: verification.authenticationInfo.newCounter })
    .eq("id", pk.id);

  await supabaseAdmin.from("pulse_challenges").delete().eq("id", ch.id);

  const { data: account, error: accErr } = await supabaseAdmin
    .from("pulse_accounts")
    .select("*")
    .eq("id", pk.account_id)
    .single();
  if (accErr || !account) throw new Error("Account missing");

  return {
    token: issueToken(pk.account_id),
    account: {
      id: account.id,
      userName: account.user_name,
      contactName: account.contact_name,
      contactEmail: account.contact_email,
      lastCheckin: account.last_checkin,
    },
  };
}

// --- Sync state ---

export interface SyncedState {
  userName: string;
  contactName: string;
  contactEmail: string;
  lastCheckin: string | null;
}

export async function pushState(token: string, state: SyncedState) {
  const accountId = verifyToken(token);
  const { error } = await supabaseAdmin
    .from("pulse_accounts")
    .update({
      user_name: state.userName,
      contact_name: state.contactName,
      contact_email: state.contactEmail,
      last_checkin: state.lastCheckin,
    })
    .eq("id", accountId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function pullState(token: string) {
  const accountId = verifyToken(token);
  const { data, error } = await supabaseAdmin
    .from("pulse_accounts")
    .select("*")
    .eq("id", accountId)
    .single();
  if (error || !data) throw new Error("Account missing");
  return {
    id: data.id,
    userName: data.user_name,
    contactName: data.contact_name,
    contactEmail: data.contact_email,
    lastCheckin: data.last_checkin,
  };
}

export async function deleteAccount(token: string) {
  const accountId = verifyToken(token);
  const { error } = await supabaseAdmin.from("pulse_accounts").delete().eq("id", accountId);
  if (error) throw new Error(error.message);
  return { ok: true };
}
