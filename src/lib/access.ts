// Access rules for tickets. Every ticket query goes through these functions,
// so the rule is enforced on the server and lives in exactly one place.

export type Role = "USER" | "MANAGER";

export interface CurrentUser {
  id: string;
  role: Role;
  organizationId: string;
  active: boolean;
}

export interface TicketOwnership {
  createdById: string;
  organizationId: string;
}

export class AccessDeniedError extends Error {}

/**
 * Returns the filter that MUST be part of every ticket query for this user.
 * - USER: only the tickets they created themselves (within their organization)
 * - MANAGER: every ticket of their organization
 */
export function ticketScopeFor(user: CurrentUser) {
  if (!user.active) throw new AccessDeniedError("Inactive users have no access");
  if (user.role === "MANAGER") return { organizationId: user.organizationId };
  return { organizationId: user.organizationId, createdById: user.id };
}

/** Same rule, for a single ticket that has already been loaded. */
export function canViewTicket(user: CurrentUser, ticket: TicketOwnership): boolean {
  if (!user.active) return false;
  if (ticket.organizationId !== user.organizationId) return false;
  return user.role === "MANAGER" || ticket.createdById === user.id;
}
