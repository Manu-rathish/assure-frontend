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
import type { Team } from "@/lib/types/org";

const LINE_ID_PATTERN = /^[A-Z][A-Z0-9-]*$/;

interface IdrCreateLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: Team[];
}

export function IdrCreateLineDialog({
  open,
  onOpenChange,
  teams,
}: IdrCreateLineDialogProps) {
  const [lineId, setLineId] = useState("");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [teamSlug, setTeamSlug] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  function reset() {
    setLineId("");
    setQuestion("");
    setCategory("");
    setTeamSlug("");
    setAssignee("");
    setDueDate("");
    setErrors({});
    setNotice("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function validate() {
    const next: Record<string, string> = {};
    const trimmedId = lineId.trim();
    if (!trimmedId) {
      next.lineId = "Line ID is required.";
    } else if (!LINE_ID_PATTERN.test(trimmedId)) {
      next.lineId = "Use uppercase letters, numbers, and hyphens (e.g. L-021).";
    } else if (trimmedId.length > 16) {
      next.lineId = "Line ID must be 16 characters or fewer.";
    }
    if (question.trim().length < 20) {
      next.question = "Question must be at least 20 characters.";
    }
    if (!category.trim()) {
      next.category = "Category is required.";
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
    setNotice("Coming soon — saving is not connected yet.");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add IDR line</DialogTitle>
          <DialogDescription>
            Manual lines validate here only. Saving is not connected yet — this
            dialog checks the form.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idr-line-id">Line ID</Label>
            <Input
              id="idr-line-id"
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              placeholder="L-021"
            />
            {errors.lineId ? (
              <p className="text-xs text-destructive">{errors.lineId}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="idr-question">Question</Label>
            <Textarea
              id="idr-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">Minimum 20 characters.</p>
            {errors.question ? (
              <p className="text-xs text-destructive">{errors.question}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="idr-category">Category</Label>
            <Input
              id="idr-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Gov, Cyber, Tech"
            />
            {errors.category ? (
              <p className="text-xs text-destructive">{errors.category}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Owner team</Label>
            <Select value={teamSlug} onValueChange={setTeamSlug}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.slug} value={team.slug}>
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
            <Label htmlFor="idr-assignee">Assignee</Label>
            <Input
              id="idr-assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idr-due">Due date</Label>
            <Input
              id="idr-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {notice ? (
            <p className="text-xs text-muted-foreground">{notice}</p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled title="Coming soon">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
