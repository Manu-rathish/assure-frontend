import { Suspense } from "react";
import { RemediationRegisterView } from "@/app/remediation/_components/remediation-register-view";
import {
  buildRegisterPageData,
  parseRegisterSearchParams,
} from "@/app/remediation/_components/remediation-register-helpers";
import { getRemediationRegisterApi } from "@/lib/api/remediation";

export default async function RemediationRegisterPage({
  searchParams,
}: PageProps<"/remediation">) {
  const rawParams = await searchParams;
  const params = parseRegisterSearchParams(rawParams);
  const raw = await getRemediationRegisterApi();
  const data = buildRegisterPageData(raw, params);

  return (
    <Suspense>
      <RemediationRegisterView data={data} />
    </Suspense>
  );
}
