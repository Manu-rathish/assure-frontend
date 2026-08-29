import { loadDummy } from "@/lib/data/dummy";
import type { User } from "@/lib/types/org";

export function getDummySessionUser(): User {
  const data = loadDummy();
  const admin = data.users.find((user) => user.role === "admin");
  if (admin) return admin;
  if (data.users[0]) return data.users[0];
  return {
    id: "user-dummy",
    email: "dummy@example.com",
    name: "Dummy User",
    role: "admin",
    teamSlug: "bdts",
    teamName: "BDTS",
  };
}

export function isStaffRole(role: string): boolean {
  return role === "admin" || role === "co";
}
