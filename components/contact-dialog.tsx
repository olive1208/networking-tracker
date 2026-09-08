"use client";

import { useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PRIORITIES, type Contact, type ContactInput, type Priority } from "@/lib/contacts/schema";

type Props = {
  open: boolean;
  contact: Contact | null;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  /** Returns a user-facing error message, or null on success. */
  onSubmit: (values: ContactInput) => Promise<string | null>;
};

export function ContactDialog({ open, contact, busy, onOpenChange, onSubmit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{contact ? "Edit contact" : "Add contact"}</DialogTitle>
          <DialogDescription>
            {contact ? "Update the details for this person." : "Someone you want to stay connected with."}
          </DialogDescription>
        </DialogHeader>
        {/* The form mounts fresh each time the dialog opens, so its state resets without effects. */}
        {open && <ContactForm contact={contact} busy={busy} onCancel={() => onOpenChange(false)} onSubmit={onSubmit} />}
      </DialogContent>
    </Dialog>
  );
}

function ContactForm({
  contact,
  busy,
  onCancel,
  onSubmit,
}: {
  contact: Contact | null;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (values: ContactInput) => Promise<string | null>;
}) {
  const [priority, setPriority] = useState<Priority>(contact?.priority ?? "medium");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values: ContactInput = {
      name: String(form.get("name") ?? ""),
      company: String(form.get("company") ?? ""),
      role: String(form.get("role") ?? ""),
      where_met: String(form.get("where_met") ?? ""),
      notes: String(form.get("notes") ?? ""),
      priority,
    };
    setError(await onSubmit(values));
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" defaultValue={contact?.name ?? ""} autoFocus />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" defaultValue={contact?.company ?? ""} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="role">Role</Label>
          <Input id="role" name="role" defaultValue={contact?.role ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="where_met">Where met</Label>
          <Input id="where_met" name="where_met" defaultValue={contact?.where_met ?? ""} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="priority">Priority *</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
            <SelectTrigger id="priority" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p} className="capitalize">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={contact?.notes ?? ""} />
      </div>
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving..." : contact ? "Save changes" : "Add contact"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function DeleteContactDialog({
  contact,
  busy,
  onCancel,
  onConfirm,
}: {
  contact: Contact | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={contact !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete {contact?.name}?</DialogTitle>
          <DialogDescription>This removes the contact permanently.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
