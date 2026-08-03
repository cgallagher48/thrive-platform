// Single source of truth for every extractable document field's display
// metadata — label, input type, and default section. Both DocumentDetail's
// layout and the "At a Glance" customization panel read from this instead
// of hard-coding field lists in two places.

import type { ExtractedFields } from "./types";

export type FieldSection = "glance" | "case" | "full";
export type FieldInput = "text" | "date" | "number" | "boolean" | "disposition" | "textarea";

export type FieldDef = {
  key: keyof Omit<ExtractedFields, "document_type">;
  label: string;
  input: FieldInput;
  // Where this field lives absent any per-company customization.
  defaultSection: FieldSection;
  // Where a glance-default field falls back to if a company unpins it.
  // Irrelevant for fields whose defaultSection isn't "glance".
  fallbackSection: "case" | "full";
};

export const FIELD_DEFS: FieldDef[] = [
  // At a Glance (default)
  { key: "deceased_name", label: "Deceased Name", input: "text", defaultSection: "glance", fallbackSection: "case" },
  { key: "date_of_death", label: "Date of Death", input: "date", defaultSection: "glance", fallbackSection: "case" },
  { key: "time_of_death", label: "Time of Death", input: "text", defaultSection: "glance", fallbackSection: "case" },
  { key: "next_of_kin_name", label: "Next of Kin", input: "text", defaultSection: "glance", fallbackSection: "case" },
  { key: "next_of_kin_relationship", label: "Relationship", input: "text", defaultSection: "glance", fallbackSection: "case" },
  { key: "next_of_kin_phone", label: "Phone", input: "text", defaultSection: "glance", fallbackSection: "case" },
  { key: "next_of_kin_cell", label: "Cell", input: "text", defaultSection: "glance", fallbackSection: "case" },

  // Case Details (default)
  { key: "date_of_birth", label: "Date of Birth", input: "date", defaultSection: "case", fallbackSection: "case" },
  { key: "age", label: "Age", input: "text", defaultSection: "case", fallbackSection: "case" },
  { key: "place_of_death", label: "Place of Death", input: "text", defaultSection: "case", fallbackSection: "case" },
  { key: "cause_of_death", label: "Cause of Death", input: "text", defaultSection: "case", fallbackSection: "case" },
  { key: "home_address", label: "Home Address", input: "text", defaultSection: "case", fallbackSection: "case" },
  { key: "disposition_type", label: "Disposition Type", input: "disposition", defaultSection: "case", fallbackSection: "case" },
  { key: "disposition_location", label: "Disposition Location", input: "text", defaultSection: "case", fallbackSection: "case" },
  { key: "funeral_director", label: "Funeral Director", input: "text", defaultSection: "case", fallbackSection: "case" },

  // Full Record (default)
  { key: "sex", label: "Sex", input: "text", defaultSection: "full", fallbackSection: "full" },
  { key: "ssn", label: "SSN", input: "text", defaultSection: "full", fallbackSection: "full" },
  { key: "marital_status", label: "Marital Status", input: "text", defaultSection: "full", fallbackSection: "full" },
  { key: "race", label: "Race", input: "text", defaultSection: "full", fallbackSection: "full" },
  { key: "hispanic_origin", label: "Hispanic Origin", input: "text", defaultSection: "full", fallbackSection: "full" },
  { key: "birthplace", label: "Birthplace", input: "text", defaultSection: "full", fallbackSection: "full" },
  { key: "occupation", label: "Occupation", input: "text", defaultSection: "full", fallbackSection: "full" },
  { key: "business_industry", label: "Business / Industry", input: "text", defaultSection: "full", fallbackSection: "full" },
  { key: "father_name", label: "Father's Name", input: "text", defaultSection: "full", fallbackSection: "full" },
  { key: "mother_maiden_name", label: "Mother's Maiden Name", input: "text", defaultSection: "full", fallbackSection: "full" },
  { key: "physician_name", label: "Physician", input: "text", defaultSection: "full", fallbackSection: "full" },
  { key: "physician_phone", label: "Physician Phone", input: "text", defaultSection: "full", fallbackSection: "full" },
  { key: "armed_forces", label: "Armed Forces", input: "boolean", defaultSection: "full", fallbackSection: "full" },
  { key: "num_death_certificates", label: "# Death Certificates", input: "number", defaultSection: "full", fallbackSection: "full" },
  { key: "education", label: "Education", input: "text", defaultSection: "full", fallbackSection: "full" },
  { key: "service_date", label: "Service Date", input: "date", defaultSection: "full", fallbackSection: "full" },
  { key: "notes", label: "Notes", input: "textarea", defaultSection: "full", fallbackSection: "full" },
];

export const FIELD_BY_KEY: Record<string, FieldDef> = Object.fromEntries(FIELD_DEFS.map((f) => [f.key, f]));

export const DEFAULT_GLANCE_ORDER: string[] = FIELD_DEFS.filter((f) => f.defaultSection === "glance").map((f) => f.key);

// Resolves the effective section layout given a company's saved "At a
// Glance" order (empty/null means "use the default"). Returns field keys
// grouped and ordered for direct rendering.
export function resolveFieldSections(pinned: string[] | null | undefined): {
  glance: string[];
  case: string[];
  full: string[];
} {
  const glance =
    pinned && pinned.length > 0 ? pinned.filter((key) => key in FIELD_BY_KEY) : [...DEFAULT_GLANCE_ORDER];
  const glanceSet = new Set(glance);

  const caseSection: string[] = [];
  const full: string[] = [];

  for (const def of FIELD_DEFS) {
    if (glanceSet.has(def.key)) continue;
    const section = def.defaultSection === "glance" ? def.fallbackSection : def.defaultSection;
    (section === "case" ? caseSection : full).push(def.key);
  }

  return { glance, case: caseSection, full };
}
