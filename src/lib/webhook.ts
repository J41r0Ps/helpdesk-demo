import { createHmac, timingSafeEqual } from "node:crypto";

/** Signs a raw request body with the shared secret (HMAC-SHA256, hex). */
export function signPayload(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

/**
 * Checks that a webhook really comes from the ticket system.
 * Uses a constant-time comparison so the signature cannot be guessed byte by byte.
 */
export function isValidSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = Buffer.from(signPayload(rawBody, secret), "hex");
  const received = Buffer.from(signature, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/** Shape of the events our (simulated) ticket system sends. */
export interface TicketSystemEvent {
  eventId: string; // unique per event -> used for idempotency
  type: "message.created" | "status.changed";
  externalTicketId: string;
  message?: { authorName: string; body: string };
  status?: "OPEN" | "IN_PROGRESS" | "WAITING_FOR_CUSTOMER" | "RESOLVED" | "CLOSED";
}
