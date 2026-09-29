import { getCurrentUser } from "@/lib/current-user";
import { ticketScopeFor } from "@/lib/access";
import { prisma } from "@/lib/db";

export default async function TicketsPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <p className="text-gray-600">Choose a user in the top right to see tickets.</p>;
  }

  const count = await prisma.ticket.count({ where: ticketScopeFor(user) });

  return (
    <div>
      <h1 className="text-2xl font-bold">Tickets</h1>
      <p className="text-gray-600">
        Logged in as {user.name} ({user.role.toLowerCase()}, {user.organization.name}): you can see{" "}
        <strong>{count}</strong> tickets.
      </p>
    </div>
  );
}