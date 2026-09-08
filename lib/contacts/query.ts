import type { Contact, Priority } from "./schema";

export type SortKey = "name" | "priority" | "created_at";
export type SortDir = "asc" | "desc";
export type PriorityFilter = Priority | "all";

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/** Pure, side-effect-free filtering + sorting used by the table view. */
export function applyQuery(
  contacts: Contact[],
  opts: { search: string; priority: PriorityFilter; sortKey: SortKey; sortDir: SortDir },
): Contact[] {
  const q = opts.search.trim().toLowerCase();
  const filtered = contacts.filter((c) => {
    if (opts.priority !== "all" && c.priority !== opts.priority) return false;
    if (!q) return true;
    return [c.name, c.company, c.role, c.where_met, c.notes]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(q));
  });

  const dir = opts.sortDir === "asc" ? 1 : -1;
  return [...filtered].sort((a, b) => {
    let cmp = 0;
    if (opts.sortKey === "name") cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    else if (opts.sortKey === "priority") cmp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    else cmp = a.created_at.localeCompare(b.created_at);
    return cmp * dir;
  });
}
