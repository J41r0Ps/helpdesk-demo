// Fills the database with fictional demo data. Run with: npx prisma db seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function main() {
  // Start from a clean database, children before parents
  await prisma.webhookEvent.deleteMany();
  await prisma.message.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const sunvalley = await prisma.organization.create({ data: { name: "Sunvalley Nuts" } });
  const orchard = await prisma.organization.create({ data: { name: "Orchard Foods" } });

  const [anna, ben, clara] = await Promise.all([
    prisma.user.create({ data: { name: "Anna Peeters", email: "anna@sunvalley.test", organizationId: sunvalley.id } }),
    prisma.user.create({ data: { name: "Ben Janssens", email: "ben@sunvalley.test", organizationId: sunvalley.id } }),
    prisma.user.create({ data: { name: "Clara Maes", email: "clara@sunvalley.test", role: "MANAGER", organizationId: sunvalley.id } }),
  ]);
  const [david] = await Promise.all([
    prisma.user.create({ data: { name: "David Claes", email: "david@orchard.test", organizationId: orchard.id } }),
    prisma.user.create({ data: { name: "Eva Wouters", email: "eva@orchard.test", role: "MANAGER", organizationId: orchard.id } }),
  ]);

  const sorterA = await prisma.machine.create({ data: { name: "Sorter line 1", serialNumber: "SV-0001", organizationId: sunvalley.id } });
  const sorterB = await prisma.machine.create({ data: { name: "Inspection unit", serialNumber: "SV-0002", organizationId: sunvalley.id } });
  const sorterC = await prisma.machine.create({ data: { name: "Sorter line A", serialNumber: "OF-0001", organizationId: orchard.id } });

  const tickets = [
    { externalId: "TS-1001", subject: "Camera image is blurry", problemType: "IMAGE_QUALITY", priority: "HIGH", status: "OPEN", by: anna, org: sunvalley, machine: sorterA, since: 2 },
    { externalId: "TS-1002", subject: "Reject valve sticks", problemType: "MECHANICAL", priority: "URGENT", status: "IN_PROGRESS", by: ben, org: sunvalley, machine: sorterB, since: 5 },
    { externalId: "TS-1003", subject: "Report export fails", problemType: "SOFTWARE", priority: "MEDIUM", status: "WAITING_FOR_CUSTOMER", by: anna, org: sunvalley, machine: null, since: 9 },
    { externalId: "TS-1004", subject: "Machine offline since update", problemType: "CONNECTIVITY", priority: "HIGH", status: "RESOLVED", by: ben, org: sunvalley, machine: sorterA, since: 20 },
    { externalId: "TS-2001", subject: "Unexpected stop during shift", problemType: "OTHER", priority: "LOW", status: "OPEN", by: david, org: orchard, machine: sorterC, since: 1 },
  ] as const;

  for (const t of tickets) {
    await prisma.ticket.create({
      data: {
        externalId: t.externalId,
        subject: t.subject,
        description: `Demo ticket: ${t.subject.toLowerCase()}.`,
        problemType: t.problemType,
        priority: t.priority,
        status: t.status,
        since: daysAgo(t.since),
        createdAt: daysAgo(t.since),
        organizationId: t.org.id,
        createdById: t.by.id,
        machineId: t.machine?.id ?? null,
        messages: {
          create: [
            { authorType: "CUSTOMER", authorName: t.by.name, body: `Hello, we have a problem: ${t.subject.toLowerCase()}.`, createdAt: daysAgo(t.since) },
            ...(t.status !== "OPEN"
              ? [{ authorType: "SUPPORT" as const, authorName: "Support", body: "Thanks, we are looking into it.", createdAt: daysAgo(t.since - 1) }]
              : []),
          ],
        },
      },
    });
  }

  console.log(`Seeded 2 organizations, 5 users (${clara.name} is a manager), 3 machines, ${tickets.length} tickets.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
