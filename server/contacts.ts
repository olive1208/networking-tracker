"use server";

import { type Contact, validateContactInput } from "@/lib/contacts/schema";
import { dataApiFor, describeDbError } from "@/server/neon";

export type ActionResult<T> = { data: T; error?: undefined } | { data?: undefined; error: string };

const SIGNED_OUT = "You are signed out. Please sign in again.";
const COLUMNS = "id, user_id, name, company, role, where_met, notes, priority, created_at";

export async function listContacts(token: string | null): Promise<ActionResult<Contact[]>> {
  if (!token) return { error: SIGNED_OUT };
  const { data, error } = await dataApiFor(token)
    .from("contacts")
    .select(COLUMNS)
    .order("created_at", { ascending: false });
  if (error) return { error: describeDbError(error) };
  return { data: (data ?? []) as Contact[] };
}

export async function createContact(token: string | null, input: unknown): Promise<ActionResult<Contact>> {
  if (!token) return { error: SIGNED_OUT };
  const valid = validateContactInput(input);
  if (!valid.ok) return { error: valid.message };
  // user_id is intentionally omitted: the column defaults to auth.user_id() and
  // the INSERT policy's WITH CHECK rejects any other value.
  const { data, error } = await dataApiFor(token)
    .from("contacts")
    .insert(valid.values)
    .select(COLUMNS)
    .single();
  if (error) return { error: describeDbError(error) };
  return { data: data as Contact };
}

export async function updateContact(token: string | null, id: string, input: unknown): Promise<ActionResult<Contact>> {
  if (!token) return { error: SIGNED_OUT };
  if (typeof id !== "string" || !id) return { error: "Missing contact id." };
  const valid = validateContactInput(input);
  if (!valid.ok) return { error: valid.message };
  const { data, error } = await dataApiFor(token)
    .from("contacts")
    .update({
      name: valid.values.name,
      company: valid.values.company ?? null,
      role: valid.values.role ?? null,
      where_met: valid.values.where_met ?? null,
      notes: valid.values.notes ?? null,
      priority: valid.values.priority,
    })
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();
  if (error) return { error: describeDbError(error) };
  if (!data) return { error: "That contact no longer exists." };
  return { data: data as Contact };
}

export async function deleteContact(token: string | null, id: string): Promise<ActionResult<{ id: string }>> {
  if (!token) return { error: SIGNED_OUT };
  if (typeof id !== "string" || !id) return { error: "Missing contact id." };
  const { data, error } = await dataApiFor(token)
    .from("contacts")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return { error: describeDbError(error) };
  if (!data) return { error: "That contact no longer exists." };
  return { data: { id: String(data.id) } };
}
