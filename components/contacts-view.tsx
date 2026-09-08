"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactDialog, DeleteContactDialog } from "@/components/contact-dialog";
import { ContactsTable } from "@/components/contacts-table";
import { ContactsToolbar } from "@/components/contacts-toolbar";
import { signOut } from "@/lib/auth";
import { applyQuery, type PriorityFilter, type SortDir, type SortKey } from "@/lib/contacts/query";
import type { Contact, ContactInput } from "@/lib/contacts/schema";
import { getAccessToken, neon } from "@/lib/neon/client";
import { createContact, deleteContact, listContacts, updateContact } from "@/server/contacts";

type LoadState = { status: "loading" } | { status: "error"; message: string } | { status: "ready" };

const fetchContacts = async () => listContacts(await getAccessToken());

export function ContactsView() {
  const router = useRouter();
  const session = neon.auth.useSession();

  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [editor, setEditor] = useState<{ open: boolean; contact: Contact | null }>({ open: false, contact: null });
  const [pendingDelete, setPendingDelete] = useState<Contact | null>(null);
  const [busy, setBusy] = useState(false);

  const signedIn = Boolean(session.data?.user);

  useEffect(() => {
    if (!session.isPending && !session.data) router.replace("/sign-in");
  }, [session.isPending, session.data, router]);

  const applyLoadResult = useCallback((result: Awaited<ReturnType<typeof listContacts>>) => {
    if (result.error !== undefined) {
      setLoad({ status: "error", message: result.error });
      return;
    }
    setContacts(result.data);
    setLoad({ status: "ready" });
  }, []);

  // Fetch once the session is known. State is only touched inside the promise callback.
  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    fetchContacts().then((result) => {
      if (!cancelled) applyLoadResult(result);
    });
    return () => {
      cancelled = true;
    };
  }, [signedIn, applyLoadResult]);

  async function retry() {
    setLoad({ status: "loading" });
    applyLoadResult(await fetchContacts());
  }

  const visible = useMemo(
    () => applyQuery(contacts, { search, priority, sortKey, sortDir }),
    [contacts, search, priority, sortKey, sortDir],
  );

  function onSort(key: SortKey) {
    if (key === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir(key === "created_at" ? "desc" : "asc");
    }
  }

  async function onSave(values: ContactInput): Promise<string | null> {
    setBusy(true);
    const token = await getAccessToken();
    const result = editor.contact
      ? await updateContact(token, editor.contact.id, values)
      : await createContact(token, values);
    setBusy(false);
    if (result.error !== undefined) return result.error;
    const saved = result.data;
    setContacts((prev) =>
      editor.contact ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev],
    );
    toast.success(editor.contact ? "Contact updated" : "Contact added");
    setEditor({ open: false, contact: null });
    return null;
  }

  async function onConfirmDelete() {
    if (!pendingDelete) return;
    setBusy(true);
    const result = await deleteContact(await getAccessToken(), pendingDelete.id);
    setBusy(false);
    if (result.error !== undefined) {
      toast.error(result.error);
      return;
    }
    setContacts((prev) => prev.filter((c) => c.id !== result.data.id));
    toast.success("Contact deleted");
    setPendingDelete(null);
  }

  async function onSignOut() {
    const result = await signOut();
    if (result.error) toast.error(result.error);
    else router.replace("/sign-in");
  }

  if (session.isPending || !signedIn) {
    return <Skeleton className="h-64 w-full" aria-label="Loading your session" />;
  }

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Networking Tracker</h1>
          <p className="text-sm text-muted-foreground">Signed in as {session.data?.user.email}</p>
        </div>
        <Button variant="outline" onClick={onSignOut}>
          Sign out
        </Button>
      </header>

      <ContactsToolbar
        search={search}
        onSearchChange={setSearch}
        priority={priority}
        onPriorityChange={setPriority}
        onAdd={() => setEditor({ open: true, contact: null })}
      />

      {load.status === "loading" && (
        <div className="grid gap-2" aria-busy="true" aria-label="Loading contacts">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {load.status === "error" && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Could not load contacts</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
            <span>{load.message}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void retry()}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {load.status === "ready" && contacts.length === 0 && (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">No contacts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add the first person you met at Berkeley that you want to stay connected with.
          </p>
          <Button className="mt-4" onClick={() => setEditor({ open: true, contact: null })}>
            Add contact
          </Button>
        </div>
      )}

      {load.status === "ready" && contacts.length > 0 && (
        <ContactsTable
          contacts={visible}
          totalCount={contacts.length}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={onSort}
          onEdit={(contact) => setEditor({ open: true, contact })}
          onDelete={setPendingDelete}
        />
      )}

      <ContactDialog
        open={editor.open}
        contact={editor.contact}
        busy={busy}
        onOpenChange={(open) => setEditor((prev) => ({ ...prev, open }))}
        onSubmit={onSave}
      />
      <DeleteContactDialog
        contact={pendingDelete}
        busy={busy}
        onCancel={() => setPendingDelete(null)}
        onConfirm={onConfirmDelete}
      />
    </>
  );
}
