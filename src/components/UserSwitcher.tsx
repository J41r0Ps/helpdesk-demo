import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { logout, switchUser } from "@/app/actions/demo-login";

export async function UserSwitcher() {
  const [users, currentUser] = await Promise.all([
    prisma.user.findMany({
      where: { active: true },
      include: { organization: true },
      orderBy: [{ organization: { name: "asc" } }, { name: "asc" }],
    }),
    getCurrentUser(),
  ]);

  return (
    <form action={switchUser} className="flex items-center gap-2 text-sm">
      <label htmlFor="userId" className="text-gray-500">
        Log in as
      </label>
      <select
        id="userId"
        name="userId"
        defaultValue={currentUser?.id ?? ""}
        className="rounded border border-gray-300 px-2 py-1"
      >
        <option value="" disabled>
          Choose a user…
        </option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} · {u.organization.name}
            {u.role === "MANAGER" ? " (manager)" : ""}
          </option>
        ))}
      </select>
      <button type="submit" className="rounded bg-emerald-700 px-3 py-1 text-white hover:bg-emerald-800">
        Switch
      </button>
      {currentUser && (
        <button formAction={logout} className="text-gray-500 underline">
          Log out
        </button>
      )}
    </form>
  );
}