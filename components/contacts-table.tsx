"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SortDir, SortKey } from "@/lib/contacts/query";
import type { Contact, Priority } from "@/lib/contacts/schema";

type Props = {
  contacts: Contact[];
  totalCount: number;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
};

const PRIORITY_VARIANT: Record<Priority, "destructive" | "default" | "secondary"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const formatDate = (iso: string) => dateFormat.format(new Date(iso));

function SortHeader({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = column === sortKey;
  return (
    <TableHead aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1 font-medium hover:underline"
      >
        {label}
        <span aria-hidden="true" className="text-xs text-muted-foreground">
          {active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </TableHead>
  );
}

export function ContactsTable({ contacts, totalCount, sortKey, sortDir, onSort, onEdit, onDelete }: Props) {
  const sortProps = { sortKey, sortDir, onSort };

  if (contacts.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No contacts match your search or filter. {totalCount} contact{totalCount === 1 ? "" : "s"} hidden.
      </p>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="grid gap-3 md:hidden">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-muted-foreground">Sort by</span>
          {(["name", "priority", "created_at"] as SortKey[]).map((key) => (
            <button
              key={key}
              type="button"
              className={key === sortKey ? "font-semibold underline" : "underline-offset-2 hover:underline"}
              onClick={() => onSort(key)}
            >
              {key === "created_at" ? "Added" : key}
              {key === sortKey ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
            </button>
          ))}
        </div>
        {contacts.map((c) => (
          <Card key={c.id}>
            <CardContent className="grid gap-2 pt-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[c.role, c.company].filter(Boolean).join(" at ") || "No role or company"}
                  </p>
                </div>
                <Badge variant={PRIORITY_VARIANT[c.priority]} className="capitalize">
                  {c.priority}
                </Badge>
              </div>
              {c.where_met && <p className="text-sm">Met: {c.where_met}</p>}
              {c.notes && <p className="text-sm text-muted-foreground whitespace-pre-line">{c.notes}</p>}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">Added {formatDate(c.created_at)}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(c)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(c)}>
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop: sortable table */}
      <div className="hidden overflow-x-auto rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader label="Name" column="name" {...sortProps} />
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Where met</TableHead>
              <SortHeader label="Priority" column="priority" {...sortProps} />
              <SortHeader label="Added" column="created_at" {...sortProps} />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  {c.name}
                  {c.notes && (
                    <p className="max-w-xs truncate text-xs text-muted-foreground" title={c.notes}>
                      {c.notes}
                    </p>
                  )}
                </TableCell>
                <TableCell>{c.company ?? "—"}</TableCell>
                <TableCell>{c.role ?? "—"}</TableCell>
                <TableCell>{c.where_met ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={PRIORITY_VARIANT[c.priority]} className="capitalize">
                    {c.priority}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(c.created_at)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => onEdit(c)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="ml-2 text-destructive" onClick={() => onDelete(c)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
