"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { EngagementListItem } from "@/lib/types/engagement";
import type { User } from "@/lib/types/org";
import { cn } from "@/lib/utils";

const ENGAGEMENT_TYPES = [
  { value: "RBI-EXAM", label: "RBI Exam" },
  { value: "ISO", label: "ISO" },
  { value: "THIRD-PARTY", label: "Third-party" },
  { value: "INTERNAL", label: "Internal" },
] as const;

const fieldLabelClass = "text-xs text-muted-foreground";
const requiredMark = <span className="ml-0.5 text-red-500">*</span>;
const errorClass = "text-xs text-red-600 dark:text-red-400";

const emptyForm = {
  name: "",
  type: "",
  code: "",
  leadUserId: "",
  startDate: "",
  endDate: "",
  slaScope: "",
  notes: "",
};

type FormState = typeof emptyForm;
type FieldKey = keyof FormState;

function toEngagementId(code: string) {
  const slug = code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `eng-${slug || "new"}`;
}

function validate(
  form: FormState,
  existingCodes: string[],
): Partial<Record<FieldKey, string>> {
  const errors: Partial<Record<FieldKey, string>> = {};
  const name = form.name.trim();
  const code = form.code.trim();
  const slaScope = form.slaScope.trim();

  if (!name) errors.name = "Enter an engagement name.";
  if (!form.type) errors.type = "Select a type.";
  if (!code) errors.code = "Enter a unique code.";
  else if (
    existingCodes.some((item) => item.toLowerCase() === code.toLowerCase())
  ) {
    errors.code = "This code is already in use.";
  }
  if (!form.leadUserId) errors.leadUserId = "Select a compliance officer.";
  if (!form.startDate) errors.startDate = "Pick a start date.";
  if (!form.endDate) errors.endDate = "Pick an end date.";
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = "End date must be on or after the start date.";
  }
  if (!slaScope) errors.slaScope = "Describe the SLA policy and scope.";
  return errors;
}

interface CreateEngagementDialogProps {
  existingCodes: string[];
  coUsers: User[];
  onCreated: (item: EngagementListItem) => void;
}

export function CreateEngagementDialog({
  existingCodes,
  coUsers,
  onCreated,
}: CreateEngagementDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  function setField<K extends FieldKey>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setForm(emptyForm);
      setErrors({});
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form, existingCodes);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const lead = coUsers.find((user) => user.id === form.leadUserId);
    if (!lead) {
      setErrors({ leadUserId: "Select a compliance officer." });
      return;
    }

    const code = form.code.trim();
    onCreated({
      id: toEngagementId(code),
      code,
      name: form.name.trim(),
      status: "active",
      leadName: lead.name,
      phase: "IDR",
      openLineCount: 0,
      nextDueDate: `${form.endDate}T00:00:00.000Z`,
      dueWithin48h: 0,
      overdue: 0,
    });
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus />
          New Engagement
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[min(90dvh,100%)] w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:w-full sm:max-w-4xl"
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Create New Engagement
          </DialogTitle>
          <DialogDescription>
            Define the code, owner, period, and SLA scope for a new audit.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
          noValidate
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:space-y-6 sm:px-6 sm:py-4">
            <section className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-sm font-medium">Basics</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Name, type, code, and who owns this engagement.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <Field id="engagement-name" label="Name" required error={errors.name}>
                  <Input
                    id="engagement-name"
                    placeholder="e.g. RBI IT Examination — FY28"
                    className="h-9"
                    value={form.name}
                    aria-invalid={Boolean(errors.name)}
                    onChange={(event) => setField("name", event.target.value)}
                  />
                </Field>
                <Field id="engagement-type" label="Type" required error={errors.type}>
                  <Select
                    value={form.type || undefined}
                    onValueChange={(value) => setField("type", value)}
                  >
                    <SelectTrigger
                      id="engagement-type"
                      className="h-9"
                      aria-invalid={Boolean(errors.type)}
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENGAGEMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field id="engagement-code" label="Code" required error={errors.code}>
                  <Input
                    id="engagement-code"
                    placeholder="RBI-IT-EXAM-FY28"
                    className="h-9 font-mono"
                    value={form.code}
                    aria-invalid={Boolean(errors.code)}
                    onChange={(event) => setField("code", event.target.value)}
                  />
                </Field>
                <Field id="engagement-co" label="CO" required error={errors.leadUserId}>
                  <Select
                    value={form.leadUserId || undefined}
                    onValueChange={(value) => setField("leadUserId", value)}
                  >
                    <SelectTrigger
                      id="engagement-co"
                      className="h-9"
                      aria-invalid={Boolean(errors.leadUserId)}
                    >
                      <SelectValue placeholder="Select CO" />
                    </SelectTrigger>
                    <SelectContent>
                      {coUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </section>

            <Separator />

            <section className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-sm font-medium">Period</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Dates, SLA policy, and notes.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <Field id="engagement-start" label="Start date" required error={errors.startDate}>
                  <Input
                    id="engagement-start"
                    type="date"
                    className="h-9"
                    value={form.startDate}
                    aria-invalid={Boolean(errors.startDate)}
                    onChange={(event) => setField("startDate", event.target.value)}
                  />
                </Field>
                <Field id="engagement-end" label="End date" required error={errors.endDate}>
                  <Input
                    id="engagement-end"
                    type="date"
                    className="h-9"
                    value={form.endDate}
                    aria-invalid={Boolean(errors.endDate)}
                    onChange={(event) => setField("endDate", event.target.value)}
                  />
                </Field>
                <Field
                  id="engagement-sla"
                  label="SLA & Scope"
                  required
                  error={errors.slaScope}
                  className="sm:col-span-2"
                >
                  <Textarea
                    id="engagement-sla"
                    placeholder="SLA policy and audit scope"
                    className="min-h-20"
                    value={form.slaScope}
                    aria-invalid={Boolean(errors.slaScope)}
                    onChange={(event) => setField("slaScope", event.target.value)}
                  />
                </Field>
                <Field
                  id="engagement-notes"
                  label="Notes"
                  error={errors.notes}
                  className="sm:col-span-2"
                >
                  <Textarea
                    id="engagement-notes"
                    placeholder="Optional"
                    value={form.notes}
                    onChange={(event) => setField("notes", event.target.value)}
                  />
                </Field>
              </div>
            </section>
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t bg-background px-4 py-3 sm:px-6 sm:py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Engagement</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  required,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className={fieldLabelClass}>
        {label}
        {required ? requiredMark : null}
      </Label>
      {children}
      {error ? (
        <p className={errorClass} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
