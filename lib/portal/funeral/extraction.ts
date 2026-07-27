// Document extraction pipeline — Company Files hero feature, funeral
// vertical. Sends uploaded scans/PDFs to Claude's vision model and returns
// structured, validated fields.
//
// Unlike the south-chicago-chapel prototype this was ported from, there is
// no canned "demo extraction" fallback here — this pipeline now writes real
// records for a real client. If ANTHROPIC_API_KEY isn't set, the document
// still uploads and persists, but every field comes back null
// (extraction_status: "skipped_no_api_key") rather than a fabricated
// example. Never invents a value for a field that isn't legible — missing
// fields are always null.

import Anthropic from "@anthropic-ai/sdk";
import type { DocumentType, ExtractedFields, ExtractionStatus } from "./types";
import { DOCUMENT_TYPES } from "./types";

export type ExtractionResult = {
  status: ExtractionStatus;
  fields: ExtractedFields;
  raw: unknown;
};

const EXTRACTION_SYSTEM_PROMPT = `You extract structured intake information from funeral home paperwork (death certificates, service contracts, intake forms, invoices, permits, and other related documents).

Four fields matter most and are usually present somewhere on this paperwork, even when worded differently document to document — look hard for each one under any of its common labels before giving up on it:
- deceased_name — labeled as "Decedent", "Deceased", "Name of Deceased", or simply "Name" on a death certificate.
- family_name — the next of kin / primary contact — labeled as "Next of Kin", "Informant", "Responsible Party", "Family Contact", or "Contact Name".
- date_of_death — labeled as "Date of Death", "DOD", or phrased as "Died on" / "Date Died".
- phone_numbers — any phone or contact number on the document, however labeled ("Phone", "Contact No.", "Tel.", "Cell").

Read the provided scan or PDF carefully and return only what is actually legible in the document. If a field is not present, not legible, or you are not confident about it, return null for that field — never guess, infer, or fabricate a value, even for the four priority fields above. Phone numbers should be returned in the format they appear in the document. date_of_death and service_date are different things — do not confuse a funeral/visitation date with the date of death. document_type must be your best classification of the document into exactly one of: ${DOCUMENT_TYPES.join(", ")}.`;

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    deceased_name: { type: ["string", "null"], description: "Full name of the deceased, if present." },
    family_name: { type: ["string", "null"], description: "Name of the next of kin / primary family contact." },
    phone_numbers: {
      type: ["array", "null"],
      items: { type: "string" },
      description: "Phone numbers found in the document, as written.",
    },
    date_of_death: { type: ["string", "null"], description: "Date the person died, in YYYY-MM-DD form if determinable. Distinct from service_date." },
    service_date: { type: ["string", "null"], description: "Date of the funeral/visitation service, in YYYY-MM-DD form if determinable. Distinct from date_of_death." },
    document_type: {
      type: ["string", "null"],
      enum: [...DOCUMENT_TYPES, null],
      description: "Best-guess classification of the document type.",
    },
    address: { type: ["string", "null"], description: "A street address associated with the deceased or family." },
    notes: { type: ["string", "null"], description: "Any other short, relevant detail worth surfacing (one sentence)." },
  },
  required: [
    "deceased_name",
    "family_name",
    "phone_numbers",
    "date_of_death",
    "service_date",
    "document_type",
    "address",
    "notes",
  ],
  additionalProperties: false,
} as const;

const EMPTY_FIELDS: ExtractedFields = {
  deceased_name: null,
  family_name: null,
  phone_numbers: null,
  date_of_death: null,
  service_date: null,
  document_type: null,
  address: null,
  notes: null,
};

function normalizeFields(raw: unknown): ExtractedFields {
  if (typeof raw !== "object" || raw === null) return { ...EMPTY_FIELDS };
  const r = raw as Record<string, unknown>;
  const documentType =
    typeof r.document_type === "string" && (DOCUMENT_TYPES as readonly string[]).includes(r.document_type)
      ? (r.document_type as DocumentType)
      : null;
  return {
    deceased_name: typeof r.deceased_name === "string" ? r.deceased_name : null,
    family_name: typeof r.family_name === "string" ? r.family_name : null,
    phone_numbers: Array.isArray(r.phone_numbers)
      ? r.phone_numbers.filter((p): p is string => typeof p === "string")
      : null,
    date_of_death: typeof r.date_of_death === "string" ? r.date_of_death : null,
    service_date: typeof r.service_date === "string" ? r.service_date : null,
    document_type: documentType,
    address: typeof r.address === "string" ? r.address : null,
    notes: typeof r.notes === "string" ? r.notes : null,
  };
}

export type ExtractionInput = {
  // Always a PDF now — every upload is converted server-side
  // (lib/portal/documents/convert-to-pdf.ts) before extraction ever runs.
  base64: string;
};

export async function extractDocumentFields(input: ExtractionInput): Promise<ExtractionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { status: "skipped_no_api_key", fields: { ...EMPTY_FIELDS }, raw: null };
  }

  const contentBlock = {
    type: "document" as const,
    source: { type: "base64" as const, media_type: "application/pdf" as const, data: input.base64 },
  };

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: EXTRACTION_SCHEMA },
      },
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            contentBlock,
            {
              type: "text",
              text: "Extract the fields from this document as JSON, per the schema. Return null for anything not legible or not present — never guess.",
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { status: "failed", fields: { ...EMPTY_FIELDS }, raw: response };
    }

    const parsed = JSON.parse(textBlock.text);
    return { status: "complete", fields: normalizeFields(parsed), raw: response };
  } catch (error) {
    return {
      status: "failed",
      fields: { ...EMPTY_FIELDS },
      raw: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}
