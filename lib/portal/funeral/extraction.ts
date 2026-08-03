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

const EXTRACTION_SYSTEM_PROMPT = `You extract structured intake information from funeral home paperwork — intake sheets, death certificates, cremation certificates, coroner's permits to cremate, service contracts, invoices, and other related documents. Each document typically carries only a subset of the fields below; leave everything else null rather than guessing.

Five fields matter most and are usually present somewhere on this paperwork, even when worded differently document to document — look hard for each one under any of its common labels before giving up on it:
- deceased_name — labeled as "Decedent", "Deceased", "Name of Deceased", or simply "Name" on a death certificate.
- next_of_kin_name — the next of kin / primary contact — labeled as "Next of Kin", "Informant", "Responsible Party", "Family Contact", or "Contact Name".
- date_of_death — labeled as "Date of Death", "DOD", or phrased as "Died on" / "Date Died".
- next_of_kin_phone / next_of_kin_cell — labeled as "Phone", "Home Phone", "Telephone", "Contact No.", "Cell", "Mobile", or "Mobile No.".

Read the provided scan or PDF carefully and return only what is actually legible in the document. If a field is not present, not legible, or you are not confident about it, return null for that field — never guess, infer, or fabricate a value, even for the priority fields above. date_of_death and service_date are different things — do not confuse a funeral/visitation date with the date of death. document_type must be your best classification of the document into exactly one of: ${DOCUMENT_TYPES.join(", ")}.`;

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    deceased_name: { type: ["string", "null"], description: "Full name of the deceased. Labels: Decedent, Deceased, Name of Deceased, Name." },
    date_of_death: { type: ["string", "null"], description: "Date the person died, in YYYY-MM-DD form if determinable. Labels: Date of Death, DOD, Died on, Date Died. Distinct from service_date." },
    time_of_death: { type: ["string", "null"], description: "Time the person died, as written. Labels: Time of Death, Time Died, TOD." },
    next_of_kin_name: { type: ["string", "null"], description: "Name of the next of kin / primary family contact. Labels: Next of Kin, Informant, Responsible Party, Family Contact, Contact Name." },
    next_of_kin_relationship: { type: ["string", "null"], description: "Next of kin's relationship to the deceased. Labels: Relationship, Relationship to Deceased, Informant Relationship." },
    next_of_kin_phone: { type: ["string", "null"], description: "Next of kin's home/landline phone, as written. Labels: Phone, Home Phone, Telephone, Contact No., Tel." },
    next_of_kin_cell: { type: ["string", "null"], description: "Next of kin's cell/mobile phone, as written. Labels: Cell, Cell Phone, Mobile, Mobile No." },
    date_of_birth: { type: ["string", "null"], description: "Deceased's date of birth, in YYYY-MM-DD form if determinable. Labels: Date of Birth, DOB, Born." },
    age: { type: ["string", "null"], description: "Deceased's age, as written (may include units, e.g. '87' or '87 yrs'). Labels: Age, Age at Death." },
    sex: { type: ["string", "null"], description: "Deceased's sex/gender, as written. Labels: Sex, Gender, M/F." },
    place_of_death: { type: ["string", "null"], description: "Where death occurred. Labels: Place of Death, Location of Death, Death Occurred At, Facility Name." },
    cause_of_death: { type: ["string", "null"], description: "Cause of death. Labels: Cause of Death, Immediate Cause, Cause." },
    home_address: { type: ["string", "null"], description: "A street address associated with the deceased or family. Labels: Address, Residence, Home Address, Street Address." },
    disposition_type: {
      type: ["string", "null"],
      enum: ["Burial", "Cremation", null],
      description: "Method of final disposition. Labels: Disposition, Type of Disposition, Method of Disposition.",
    },
    disposition_location: { type: ["string", "null"], description: "Where disposition takes/took place. Labels: Place of Disposition, Cemetery, Crematory, Disposition Location." },
    funeral_director: { type: ["string", "null"], description: "Funeral director or licensee in charge. Labels: Funeral Director, FD, Licensee, Director in Charge." },
    ssn: { type: ["string", "null"], description: "Deceased's Social Security Number, as written. Labels: Social Security Number, SSN, Soc. Sec. No." },
    marital_status: { type: ["string", "null"], description: "Deceased's marital status. Labels: Marital Status, Married/Single/Widowed/Divorced." },
    race: { type: ["string", "null"], description: "Deceased's race, as written. Labels: Race." },
    hispanic_origin: { type: ["string", "null"], description: "Deceased's Hispanic origin, as written. Labels: Hispanic Origin, Of Hispanic Origin?" },
    birthplace: { type: ["string", "null"], description: "Deceased's place of birth. Labels: Birthplace, Place of Birth, Born In." },
    occupation: { type: ["string", "null"], description: "Deceased's usual occupation. Labels: Occupation, Usual Occupation, Kind of Work." },
    business_industry: { type: ["string", "null"], description: "Deceased's kind of business/industry. Labels: Kind of Business/Industry, Industry." },
    father_name: { type: ["string", "null"], description: "Deceased's father's name. Labels: Father's Name, Father." },
    mother_maiden_name: { type: ["string", "null"], description: "Deceased's mother's maiden name. Labels: Mother's Maiden Name, Mother (Maiden Name)." },
    physician_name: { type: ["string", "null"], description: "Certifying or attending physician. Labels: Certifying Physician, Physician, Attending Physician, Pronounced By." },
    physician_phone: { type: ["string", "null"], description: "Physician's phone number, as written. Labels: Physician Phone, Physician's Telephone." },
    armed_forces: { type: ["boolean", "null"], description: "Whether the deceased ever served in the US Armed Forces. Labels: Ever in US Armed Forces?, Armed Forces, Veteran. Only set true/false when explicitly marked Y/N on the document." },
    num_death_certificates: { type: ["integer", "null"], description: "Number of certified death certificate copies requested. Labels: Number of Certified Copies, No. of Death Certificates Requested, Certified Copies Requested." },
    education: { type: ["string", "null"], description: "Deceased's highest level of education. Labels: Education, Highest Grade Completed, Decedent's Education." },
    service_date: { type: ["string", "null"], description: "Date of the funeral/visitation service, in YYYY-MM-DD form if determinable. Distinct from date_of_death." },
    document_type: {
      type: ["string", "null"],
      enum: [...DOCUMENT_TYPES, null],
      description: "Best-guess classification of the document type.",
    },
    notes: { type: ["string", "null"], description: "Any other short, relevant detail worth surfacing (one sentence)." },
  },
  required: [
    "deceased_name",
    "date_of_death",
    "time_of_death",
    "next_of_kin_name",
    "next_of_kin_relationship",
    "next_of_kin_phone",
    "next_of_kin_cell",
    "date_of_birth",
    "age",
    "sex",
    "place_of_death",
    "cause_of_death",
    "home_address",
    "disposition_type",
    "disposition_location",
    "funeral_director",
    "ssn",
    "marital_status",
    "race",
    "hispanic_origin",
    "birthplace",
    "occupation",
    "business_industry",
    "father_name",
    "mother_maiden_name",
    "physician_name",
    "physician_phone",
    "armed_forces",
    "num_death_certificates",
    "education",
    "service_date",
    "document_type",
    "notes",
  ],
  additionalProperties: false,
} as const;

const EMPTY_FIELDS: ExtractedFields = {
  deceased_name: null,
  date_of_death: null,
  time_of_death: null,
  next_of_kin_name: null,
  next_of_kin_relationship: null,
  next_of_kin_phone: null,
  next_of_kin_cell: null,
  date_of_birth: null,
  age: null,
  sex: null,
  place_of_death: null,
  cause_of_death: null,
  home_address: null,
  disposition_type: null,
  disposition_location: null,
  funeral_director: null,
  ssn: null,
  marital_status: null,
  race: null,
  hispanic_origin: null,
  birthplace: null,
  occupation: null,
  business_industry: null,
  father_name: null,
  mother_maiden_name: null,
  physician_name: null,
  physician_phone: null,
  armed_forces: null,
  num_death_certificates: null,
  education: null,
  service_date: null,
  document_type: null,
  notes: null,
};

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

function normalizeFields(raw: unknown): ExtractedFields {
  if (typeof raw !== "object" || raw === null) return { ...EMPTY_FIELDS };
  const r = raw as Record<string, unknown>;
  const documentType =
    typeof r.document_type === "string" && (DOCUMENT_TYPES as readonly string[]).includes(r.document_type)
      ? (r.document_type as DocumentType)
      : null;
  const dispositionType =
    r.disposition_type === "Burial" || r.disposition_type === "Cremation" ? r.disposition_type : null;

  return {
    deceased_name: str(r.deceased_name),
    date_of_death: str(r.date_of_death),
    time_of_death: str(r.time_of_death),
    next_of_kin_name: str(r.next_of_kin_name),
    next_of_kin_relationship: str(r.next_of_kin_relationship),
    next_of_kin_phone: str(r.next_of_kin_phone),
    next_of_kin_cell: str(r.next_of_kin_cell),
    date_of_birth: str(r.date_of_birth),
    age: str(r.age),
    sex: str(r.sex),
    place_of_death: str(r.place_of_death),
    cause_of_death: str(r.cause_of_death),
    home_address: str(r.home_address),
    disposition_type: dispositionType,
    disposition_location: str(r.disposition_location),
    funeral_director: str(r.funeral_director),
    ssn: str(r.ssn),
    marital_status: str(r.marital_status),
    race: str(r.race),
    hispanic_origin: str(r.hispanic_origin),
    birthplace: str(r.birthplace),
    occupation: str(r.occupation),
    business_industry: str(r.business_industry),
    father_name: str(r.father_name),
    mother_maiden_name: str(r.mother_maiden_name),
    physician_name: str(r.physician_name),
    physician_phone: str(r.physician_phone),
    armed_forces: typeof r.armed_forces === "boolean" ? r.armed_forces : null,
    num_death_certificates: typeof r.num_death_certificates === "number" ? r.num_death_certificates : null,
    education: str(r.education),
    service_date: str(r.service_date),
    document_type: documentType,
    notes: str(r.notes),
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
