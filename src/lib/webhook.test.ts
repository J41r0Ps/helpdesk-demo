import { describe, expect, it } from "vitest";
import { isValidSignature, signPayload } from "./webhook";

const secret = "test-secret";
const body = JSON.stringify({ eventId: "evt-1", type: "message.created" });

describe("isValidSignature", () => {
  it("accepts a body signed with the right secret", () => {
    expect(isValidSignature(body, signPayload(body, secret), secret)).toBe(true);
  });

  it("rejects a body signed with another secret", () => {
    expect(isValidSignature(body, signPayload(body, "wrong"), secret)).toBe(false);
  });

  it("rejects a tampered body", () => {
    const signature = signPayload(body, secret);
    expect(isValidSignature(body.replace("evt-1", "evt-2"), signature, secret)).toBe(false);
  });

  it("rejects a missing signature", () => {
    expect(isValidSignature(body, null, secret)).toBe(false);
  });
});
