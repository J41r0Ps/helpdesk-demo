import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const DEMO_USER_COOKIE = "demoUserId";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(DEMO_USER_COOKIE)?.value;
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  });
}