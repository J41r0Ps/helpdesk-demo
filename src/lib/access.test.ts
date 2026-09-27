import { describe, expect, it } from "vitest";
import { AccessDeniedError, canViewTicket, ticketScopeFor, type CurrentUser } from "./access";

const anna: CurrentUser = { id: "anna", role: "USER", organizationId: "org-a", active: true };
const clara: CurrentUser = { id: "clara", role: "MANAGER", organizationId: "org-a", active: true };

describe("ticketScopeFor", () => {
  it("limits a user to their own tickets", () => {
    expect(ticketScopeFor(anna)).toEqual({ organizationId: "org-a", createdById: "anna" });
  });

  it("gives a manager every ticket of their organization", () => {
    expect(ticketScopeFor(clara)).toEqual({ organizationId: "org-a" });
  });

  it("refuses inactive users", () => {
    expect(() => ticketScopeFor({ ...anna, active: false })).toThrow(AccessDeniedError);
  });
});

describe("canViewTicket", () => {
  const annasTicket = { createdById: "anna", organizationId: "org-a" };
  const bensTicket = { createdById: "ben", organizationId: "org-a" };
  const otherOrgTicket = { createdById: "david", organizationId: "org-b" };

  it.each([
    ["user sees own ticket", anna, annasTicket, true],
    ["user cannot see a colleague's ticket", anna, bensTicket, false],
    ["manager sees a colleague's ticket", clara, bensTicket, true],
    ["manager cannot see another organization", clara, otherOrgTicket, false],
  ])("%s", (_name, user, ticket, expected) => {
    expect(canViewTicket(user, ticket)).toBe(expected);
  });
});
