import { loadDummy } from "@/lib/data/dummy";
import type { Team } from "@/lib/types/org";

export async function listTeamsApi(): Promise<Team[]> {
  const data = loadDummy();
  return data.teams;
}
