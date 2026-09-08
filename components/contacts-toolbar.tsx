"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PriorityFilter } from "@/lib/contacts/query";
import { PRIORITIES } from "@/lib/contacts/schema";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  priority: PriorityFilter;
  onPriorityChange: (value: PriorityFilter) => void;
  onAdd: () => void;
};

export function ContactsToolbar({ search, onSearchChange, priority, onPriorityChange, onAdd }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="grid flex-1 gap-1.5">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          type="search"
          placeholder="Name, company, role, where met, notes"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="grid gap-1.5 sm:w-44">
        <Label htmlFor="priority-filter">Priority</Label>
        <Select value={priority} onValueChange={(v) => onPriorityChange(v as PriorityFilter)}>
          <SelectTrigger id="priority-filter" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p} className="capitalize">
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onAdd} className="sm:self-end">
        Add contact
      </Button>
    </div>
  );
}
