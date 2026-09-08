import { z } from "zod";

/**
 * Shared contact validation. Imported by the server actions (enforcement) and
 * by the form (field list / types). The database CHECK constraints mirror the
 * name and priority rules as a backstop.
 */
export const PRIORITIES = ["high", "medium", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

export const contactInputSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or fewer"),
  company: optionalText(120),
  role: optionalText(120),
  where_met: optionalText(200),
  notes: optionalText(2000),
  priority: z.enum(PRIORITIES, {
    error: "Priority must be high, medium or low",
  }),
});

export type ContactInput = z.input<typeof contactInputSchema>;
export type ContactValues = z.output<typeof contactInputSchema>;

/** A contact row as stored in Postgres / returned by the Data API. */
export type Contact = {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  role: string | null;
  where_met: string | null;
  notes: string | null;
  priority: Priority;
  created_at: string;
};

export type ValidationResult =
  | { ok: true; values: ContactValues }
  | { ok: false; message: string };

/** Validate raw input and collapse zod issues into one user-facing sentence. */
export function validateContactInput(input: unknown): ValidationResult {
  const parsed = contactInputSchema.safeParse(input);
  if (parsed.success) return { ok: true, values: parsed.data };
  const message = parsed.error.issues.map((i) => i.message).join(". ");
  return { ok: false, message: message || "Invalid contact" };
}
