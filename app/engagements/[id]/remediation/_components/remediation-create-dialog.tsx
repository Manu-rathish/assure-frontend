"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { controlFocusClass } from "@/components/ui/focus-styles";
import { cn } from "@/lib/utils";
import type { ActionItemListItem } from "@/lib/types/remediation";
import type { Team } from "@/lib/types/org";
import { suggestNextActionItemId } from "./remediation-helpers";

const ID_PATTERN = /^AI-[A-Z0-9-]+$/i;

interface RemediationCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: Team[];
  items: ActionItemListItem[];
}

export function RemediationCreateDialog({
  open,
  onOpenChange,
  teams,
  items,
}: RemediationCreateDialogProps) {
  const [actionItemId, setActionItemId] = useState(() =>
    suggestNextActionItemId(items),
  );
  const [title, setTitle] = useState("");
  const [findingCode, setFindingCode] = useState("");
  const [teamSlug, setTeamSlug] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  function reset() {
    setActionItemId(suggestNextActionItemId(items));
    setTitle("");
    setFindingCode("");
    setTeamSlug("");
    setDescription("");
    setDueDate("");
    setErrors({});
    setNotice("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    else setActionItemId(suggestNextActionItemId(items));
    onOpenChange(next);
  }

  function validate() {
    const next: Record<string, string> = {};
    const trimmedId = actionItemId.trim();
    if (!trimmedId) {
      next.actionItemId = "ID is required.";
    } else if (!ID_PATTERN.test(trimmedId)) {
      next.actionItemId = "Use format AI-011 or AI-238.";
    }
    if (title.trim().length < 5) {
      next.title = "Title must be at least 5 characters.";
    }
    if (!teamSlug) {
      next.team = "Select an owner team.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice("");
    if (!validate()) return;
    setNotice("Coming soon");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add action item</DialogTitle>
            <DialogDescription>
              Track corrective work for this engagement. Saving is not connected
              yet.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ai-id">
                  ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ai-id"
                  value={actionItemId}
                  onChange={(e) => setActionItemId(e.target.value)}
                  placeholder="AI-011"
                  className={cn("font-mono", controlFocusClass)}
                />
                {errors.actionItemId ? (
                  <p className="text-xs text-destructive">{errors.actionItemId}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-finding">Finding</Label>
                <Input
                  id="ai-finding"
                  value={findingCode}
                  onChange={(e) => setFindingCode(e.target.value)}
                  placeholder="F-007"
                  className={cn("font-mono", controlFocusClass)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ai-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={controlFocusClass}
              />
              {errors.title ? (
                <p className="text-xs text-destructive">{errors.title}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-team">
                Owner team <span className="text-destructive">*</span>
              </Label>
              <Select value={teamSlug} onValueChange={setTeamSlug}>
                <SelectTrigger id="ai-team" className={controlFocusClass}>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.slug}>
                      {team.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.team ? (
                <p className="text-xs text-destructive">{errors.team}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-description">Description</Label>
              <Textarea
                id="ai-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={controlFocusClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-due">Due date</Label>
              <Input
                id="ai-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={controlFocusClass}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {notice ? (
              <span className="mr-auto text-xs text-muted-foreground">
                {notice}
              </span>
            ) : null}
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add action item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
