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
import type { IdrLineListItem } from "@/lib/types/adr";
import type { Team } from "@/lib/types/org";

interface AdrCreateLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idrLines: IdrLineListItem[];
  teams: Team[];
}

export function AdrCreateLineDialog({
  open,
  onOpenChange,
  idrLines,
  teams,
}: AdrCreateLineDialogProps) {
  const [parentLineId, setParentLineId] = useState("");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [teamSlug, setTeamSlug] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  function reset() {
    setParentLineId("");
    setQuestion("");
    setCategory("");
    setTeamSlug("");
    setAssignee("");
    setDueDate("");
    setErrors([]);
    setNotice("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function validate() {
    const next: string[] = [];
    if (!parentLineId) next.push("Select a parent IDR line.");
    if (!question.trim()) next.push("Enter the follow-up question.");
    if (!category.trim()) next.push("Enter a category.");
    if (!teamSlug) next.push("Select an owner team.");
    setErrors(next);
    return next.length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice("");
    if (!validate()) return;
    setNotice("Save will be available when the API is connected.");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add ADR line</DialogTitle>
          <DialogDescription>
            Every follow-up must link to a parent IDR line. Saving is not
            connected yet — this dialog validates the form only.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Parent IDR line</Label>
            <Select value={parentLineId} onValueChange={setParentLineId}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent line" />
              </SelectTrigger>
              <SelectContent>
                {idrLines.map((line) => (
                  <SelectItem key={line.lineId} value={line.lineId}>
                    <span className="font-mono">{line.lineId}</span>
                    {" — "}
                    {line.questionText.slice(0, 48)}
                    {line.questionText.length > 48 ? "…" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Owner team</Label>
            <Select value={teamSlug} onValueChange={setTeamSlug}>
              <SelectTrigger>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Input
              id="assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          {errors.length > 0 && (
            <ul className="space-y-1">
              {errors.map((err) => (
                <li key={err} className="text-xs text-destructive">
                  {err}
                </li>
              ))}
            </ul>
          )}
          {notice && (
            <p className="text-xs text-muted-foreground">{notice}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Validate</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
