import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import * as sync from "./sync.server";

function getOrigin(passedOrigin?: string): string {
  // Prefer the request Origin header (server-trusted). Fall back to client-passed
  // value for SSR/preview edge cases.
  const fromHeader = getRequestHeader("origin");
  const origin = fromHeader ?? passedOrigin;
  if (!origin) throw new Error("Missing origin");
  return origin;
}

export const startPasskeyRegistration = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        accountId: z.string().uuid().nullable().optional(),
        contactEmail: z.string().email().optional(),
        origin: z.string().url().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    return sync.startRegistration({
      origin: getOrigin(data.origin),
      accountId: data.accountId ?? null,
      contactEmail: data.contactEmail,
    });
  });

export const finishPasskeyRegistration = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        challengeId: z.string().uuid(),
        response: z.any(),
        origin: z.string().url().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    return sync.finishRegistration({
      origin: getOrigin(data.origin),
      challengeId: data.challengeId,
      response: data.response,
    });
  });

export const startPasskeyAuthentication = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ origin: z.string().url().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    return sync.startAuthentication({ origin: getOrigin(data.origin) });
  });

export const finishPasskeyAuthentication = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        challengeId: z.string().uuid(),
        response: z.any(),
        origin: z.string().url().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    return sync.finishAuthentication({
      origin: getOrigin(data.origin),
      challengeId: data.challengeId,
      response: data.response,
    });
  });

const stateSchema = z.object({
  userName: z.string().max(80).default(""),
  contactName: z.string().max(80).default(""),
  contactEmail: z.string().email().max(255),
  lastCheckin: z.string().datetime().nullable(),
});

export const pushSyncState = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        token: z.string().min(10).max(2048),
        state: stateSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => sync.pushState(data.token, data.state));

export const pullSyncState = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ token: z.string().min(10).max(2048) }).parse(input),
  )
  .handler(async ({ data }) => sync.pullState(data.token));

export const deleteSyncAccount = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ token: z.string().min(10).max(2048) }).parse(input),
  )
  .handler(async ({ data }) => sync.deleteAccount(data.token));
