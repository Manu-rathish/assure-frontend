import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDueDate, statusLabel } from "@/lib/formatters";
import type { AdrLineDetail } from "@/lib/types/adr";

interface AdrParentContextProps {
  engagementId: string;
  line: AdrLineDetail;
}

export function AdrParentContext({
  engagementId,
  line,
}: AdrParentContextProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs text-muted-foreground">
          IDR → ADR lineage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">
          Follow-up to IDR{" "}
          <Link
            href={`/engagements/${engagementId}/idr/lines/${line.parentIdrLineId}`}
            className="font-mono text-primary hover:underline"
          >
            {line.parentIdrLineId}
          </Link>
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="capitalize">
            {statusLabel(line.parentIdrStatus)}
          </Badge>
          <Badge variant="outline">{line.parentIdrCategory}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {line.parentIdrQuestionText}
        </p>
      </CardContent>
    </Card>
  );
}
