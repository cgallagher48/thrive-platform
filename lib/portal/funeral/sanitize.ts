// Coercion helpers shared between the AI extraction path (extraction.ts,
// which now gets every field back as a plain string — see the schema
// redesign there) and the final gate applied right before every DB write
// (data.ts). A single bad value — an unparseable date, "72 years" where a
// number belongs, "No" where a boolean belongs — must degrade to null, not
// throw and take down the whole upload.

import { DOCUMENT_TYPES, type DocumentType, type ExtractedFields } from "./types";

export function parseBoolean(raw: unknown): boolean | null {
  if (typeof raw === "boolean") return raw;
  if (typeof raw !== "string") return null;
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  if (["y", "yes", "true", "1"].includes(v)) return true;
  if (["n", "no", "false", "0"].includes(v)) return false;
  return null;
}

export function parseInteger(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? Math.trunc(raw) : null;
  if (typeof raw !== "string") return null;
  const match = raw.match(/-?\d+/);
  if (!match) return null;
  const n = parseInt(match[0], 10);
  return Number.isFinite(n) ? n : null;
}

const MONTHS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9,
  september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// Best-effort parse of a funeral-paperwork date string into YYYY-MM-DD.
// Only commits to a result when the format is unambiguous — anything
// vague ("late July", "unknown", partial/illegible) falls back to null
// rather than risk silently recording the wrong day.
export function parseDateLoose(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Already YYYY-MM-DD (optionally with a time suffix).
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const [, y, m, d] = iso;
    if (isValidDate(Number(y), Number(m), Number(d))) return `${y}-${m}-${d}`;
    return null;
  }

  // MM/DD/YYYY or M/D/YYYY (US convention, matches these forms).
  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const [, mm, dd, yyyy] = slash;
    if (isValidDate(Number(yyyy), Number(mm), Number(dd))) {
      return `${yyyy}-${pad2(Number(mm))}-${pad2(Number(dd))}`;
    }
    return null;
  }

  // "July 30, 2026" / "30 July 2026" / "Jul 30 2026" — requires a full
  // month name/abbreviation plus a day and 4-digit year, all present.
  const monthWord = trimmed.match(
    /([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})|(\d{1,2})\s+([A-Za-z]+)\.?,?\s+(\d{4})/
  );
  if (monthWord) {
    const monthName = (monthWord[1] ?? monthWord[5] ?? "").toLowerCase();
    const day = Number(monthWord[2] ?? monthWord[4]);
    const year = Number(monthWord[3] ?? monthWord[6]);
    const month = MONTHS[monthName];
    if (month && isValidDate(year, month, day)) {
      return `${year}-${pad2(month)}-${pad2(day)}`;
    }
  }

  return null;
}

function isValidDate(year: number, month: number, day: number): boolean {
  if (!year || year < 1800 || year > 2200) return false;
  if (!month || month < 1 || month > 12) return false;
  if (!day || day < 1 || day > 31) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

// Final defensive gate applied right before every DB write, regardless of
// whether the fields came from AI extraction, a manual correction, or a
// replace. Guarantees no value reaching Postgres can violate a column's
// type or check constraint — an unparseable field becomes null instead of
// failing the whole write.
export function sanitizeForWrite(fields: ExtractedFields): ExtractedFields {
  const documentType =
    fields.document_type && (DOCUMENT_TYPES as readonly string[]).includes(fields.document_type)
      ? (fields.document_type as DocumentType)
      : null;
  const dispositionType =
    fields.disposition_type === "Burial" || fields.disposition_type === "Cremation"
      ? fields.disposition_type
      : null;

  return {
    ...fields,
    date_of_death: parseDateLoose(fields.date_of_death),
    date_of_birth: parseDateLoose(fields.date_of_birth),
    service_date: parseDateLoose(fields.service_date),
    disposition_type: dispositionType,
    document_type: documentType,
    armed_forces: parseBoolean(fields.armed_forces),
    num_death_certificates: parseInteger(fields.num_death_certificates),
  };
}
