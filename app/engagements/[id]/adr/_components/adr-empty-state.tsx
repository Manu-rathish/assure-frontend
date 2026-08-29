import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdrEmptyState() {
  return (
    <Card className="gap-0 py-4">
      <CardHeader>
        <CardTitle>No ADR documents yet</CardTitle>
        <CardDescription>
          Additional Document Requests appear here after follow-up rounds are
          linked to IDR responses. Nothing to triage for this engagement yet.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
