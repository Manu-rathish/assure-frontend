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
import { controlFocusClass } from "@/components/ui/focus-styles";
import { cn } from "@/lib/utils";

interface ExaminationNewThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExaminationNewThreadDialog({
  open,
  onOpenChange,
}: ExaminationNewThreadDialogProps) {
  const [name, setName] = useState("");
  const [auditorLabel, setAuditorLabel] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  function reset() {
    setName("");
    setAuditorLabel("");
    setErrors({});
    setNotice("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function validate() {
    const next: Record<string, string> = {};
    if (name.trim().length < 3) {
      next.name = "Thread name must be at least 3 characters.";
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
            <DialogTitle>Add examination thread</DialogTitle>
            <DialogDescription>
              Represents one concurrent auditor room or session. Saving is not
              connected yet.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="thread-name">
                Thread name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="thread-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Thread 1 — IT Audit Room"
                aria-required
                className={cn(controlFocusClass)}
              />
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="auditor-label">Auditor label</Label>
              <Input
                id="auditor-label"
                value={auditorLabel}
                onChange={(e) => setAuditorLabel(e.target.value)}
                placeholder="Mr. R. Sharma"
                className={cn(controlFocusClass)}
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
            <Button type="submit">Add thread</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
