import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function IdrEmptyState() {
  return (
    <Card className="gap-0 p-6 text-center sm:p-8">
      <CardHeader className="items-center px-0">
        <CardTitle>No IDR documents yet</CardTitle>
        <CardDescription className="max-w-md text-balance">
          Initial Document Requests appear here after the auditor questionnaire
          is imported. Nothing to triage for this engagement yet.
        </CardDescription>
        <p className="mt-2 text-xs text-muted-foreground">
          Import will be available when API is connected.
        </p>
      </CardHeader>
    </Card>
  );
}
