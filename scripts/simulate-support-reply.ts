// Simulates the external ticket system calling our webhook, as if a support agent replied.
// Usage:  npx tsx scripts/simulate-support-reply.ts TS-1001 "We are sending a technician tomorrow." [RESOLVED]
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { signPayload, type TicketSystemEvent } from "../src/lib/webhook";

const [externalTicketId, text, status] = process.argv.slice(2);
if (!externalTicketId || !text) {
  console.error('Usage: npx tsx scripts/simulate-support-reply.ts <externalTicketId> "<message>" [STATUS]');
  process.exit(1);
}

const events: TicketSystemEvent[] = [
  { eventId: randomUUID(), type: "message.created", externalTicketId, message: { authorName: "Support", body: text } },
];
if (status) events.push({ eventId: randomUUID(), type: "status.changed", externalTicketId, status: status as TicketSystemEvent["status"] });

for (const event of events) {
  const body = JSON.stringify(event);
  const res = await fetch("http://localhost:3000/api/webhooks/ticket-system", {
    method: "POST",
    headers: { "content-type": "application/json", "x-signature": signPayload(body, process.env.WEBHOOK_SECRET!) },
    body,
  });
  console.log(`${event.type} -> ${res.status} ${await res.text()}`);
}
