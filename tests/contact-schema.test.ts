import { describe, expect, it } from "vitest";
import { contactInputSchema, validateContactInput } from "@/lib/contacts/schema";

const valid = {
  name: "Ada Lovelace",
  company: "Berkeley AI Research",
  role: "PhD student",
  where_met: "Soda Hall mixer",
  notes: "Follow up about the reading group.",
  priority: "high",
};

describe("contactInputSchema", () => {
  it("accepts a valid contact and trims text fields", () => {
    const result = contactInputSchema.safeParse({ ...valid, name: "  Ada Lovelace  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Ada Lovelace");
      expect(result.data.priority).toBe("high");
    }
  });

  it("accepts a contact with only the required fields and turns blanks into null", () => {
    const result = contactInputSchema.safeParse({ name: "Grace", company: "", priority: "low" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.company).toBeNull();
  });

  it("rejects an empty name", () => {
    expect(contactInputSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects a whitespace-only name", () => {
    expect(contactInputSchema.safeParse({ ...valid, name: "   " }).success).toBe(false);
  });

  it("rejects a missing name", () => {
    const { name: _omitted, ...withoutName } = valid;
    void _omitted;
    expect(contactInputSchema.safeParse(withoutName).success).toBe(false);
  });

  it("rejects an invalid priority", () => {
    expect(contactInputSchema.safeParse({ ...valid, priority: "urgent" }).success).toBe(false);
    expect(contactInputSchema.safeParse({ ...valid, priority: "" }).success).toBe(false);
  });
});

describe("validateContactInput", () => {
  it("returns a readable message instead of throwing", () => {
    const result = validateContactInput({ name: " ", priority: "urgent" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("Name is required");
      expect(result.message).toContain("Priority must be high, medium or low");
    }
  });

  it("returns parsed values for valid input", () => {
    const result = validateContactInput(valid);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.values.name).toBe("Ada Lovelace");
  });
});
