"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { controlFocusClass } from "@/components/ui/focus-styles";
import { cn } from "@/lib/utils";

interface InboxCardActionsProps {
  engagementId: string;
  lineKind: "idr" | "adr";
  internalId: string;
  lineId: string;
}

export function InboxCardActions({
  engagementId,
  lineKind,
  internalId,
  lineId,
}: InboxCardActionsProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const lineHref = `/engagements/${engagementId}/${lineKind}/lines/${lineId}`;

  function handleApprove() {
    setPending(true);
    setNotice("Coming soon");
    setTimeout(() => setPending(false), 400);
  }

  function handleReject() {
    setError("");
    if (!comment.trim()) {
      setError("A rejection comment is required.");
      return;
    }
    setPending(true);
    setNotice("Coming soon");
    setTimeout(() => {
      setPending(false);
      setRejectOpen(false);
      setComment("");
    }, 400);
  }

  return (
    <>
      <div className="mt-4 flex items-center gap-2 border-t pt-3">
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={handleApprove}
        >
          <Check className="size-3.5" aria-hidden />
          Approve
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => {
            setRejectOpen(true);
            setError("");
            setNotice("");
          }}
        >
          Reject
        </Button>
        <Button type="button" size="sm" variant="ghost" asChild>
          <Link href={lineHref}>
            <ExternalLink className="size-3.5" aria-hidden />
            Open
          </Link>
        </Button>
        {notice ? (
          <span className="text-xs text-muted-foreground">{notice}</span>
        ) : null}
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject line {lineId}</DialogTitle>
            <DialogDescription>
              Provide a comment so the response team knows what to fix.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor={`reject-${internalId}`}>Rejection comment</Label>
            <Textarea
              id={`reject-${internalId}`}
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explain what needs to change…"
              className={cn(controlFocusClass)}
            />
            {error ? (
              <p className="text-xs text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!comment.trim() || pending}
              onClick={handleReject}
            >
              Reject line
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
