import { loadDummy, paginate } from "@/lib/data/dummy";
import type { Page } from "@/lib/api/types";
import type { User } from "@/lib/types/org";

export interface ListUsersParams {
  limit?: number;
  offset?: number;
}

export async function listUsersApi(
  params: ListUsersParams = {},
): Promise<Page<User>> {
  const { limit = 50, offset = 0 } = params;
  const data = loadDummy();
  return paginate(data.users, limit, offset);
}
