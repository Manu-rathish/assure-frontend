import { redirect } from "next/navigation";

export default async function FindingsPage({
  params,
}: PageProps<"/engagements/[id]/findings">) {
  const { id } = await params;
  redirect(`/engagements/${id}/report#findings-register`);
}
