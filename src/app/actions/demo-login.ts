"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DEMO_USER_COOKIE } from "@/lib/current-user";

export async function switchUser(formData: FormData) {
  const userId = formData.get("userId");
  if (typeof userId !== "string" || userId === "") return;

  // Never trust form input: check that this user really exists and is active
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.active) return;

  const cookieStore = await cookies();
  cookieStore.set(DEMO_USER_COOKIE, user.id, {
    httpOnly: true, // JavaScript in the browser cannot read it (protects against XSS)
    sameSite: "lax", // not sent along with requests from other sites (protects against CSRF)
    path: "/",
  });

  redirect("/tickets");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_USER_COOKIE);
  redirect("/");
}