import { EngagementsView } from "@/app/engagements/_components/engagements-view";
import { listEngagementsApi } from "@/lib/api/engagements";
import { listUsersApi } from "@/lib/api/users";
import { getDummySessionUser } from "@/lib/data/session";

export default async function EngagementsPage() {
  const [list, users] = await Promise.all([
    listEngagementsApi({ limit: 500 }),
    listUsersApi({ limit: 500 }),
  ]);
  const session = getDummySessionUser();
  const coUsers = users.items.filter(
    (user) => user.role === "co" || user.role === "admin",
  );

  return (
    <EngagementsView
      initialItems={list.items}
      coUsers={coUsers}
      canCreate={session.role === "co" || session.role === "admin"}
    />
  );
}
