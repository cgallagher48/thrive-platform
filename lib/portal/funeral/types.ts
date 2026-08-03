// Funeral-vertical types — ported from south-chicago-chapel's
// lib/sample-data.ts. Only the type definitions and pure display helpers
// come along; the sample arrays don't, since this module now talks to real,
// persisted client data (see lib/portal/funeral/data.ts). There is no
// sample-data fallback here on purpose — a bug in the Supabase connection
// should surface as an error, never as fabricated data quietly standing in
// for a real client's records.

export type FamilyStatus = "active" | "pre-need" | "completed";

export type Family = {
  id: string;
  deceasedName: string | null;
  nextOfKinName: string;
  phone: string;
  email: string;
  status: FamilyStatus;
  createdAt: string;
};

export type ServiceType = "Visitation" | "Funeral" | "Burial" | "Cremation" | "Memorial";
export type ServiceStatus = "scheduled" | "completed" | "cancelled";

export type Service = {
  id: string;
  familyId: string;
  serviceType: ServiceType;
  serviceDate: string;
  location: string;
  notes: string;
  status: ServiceStatus;
};

export type DocumentType =
  | "Death Certificate"
  | "Service Contract"
  | "Intake Form"
  | "Invoice"
  | "Permit"
  | "Other";

export const DOCUMENT_TYPES: DocumentType[] = [
  "Death Certificate",
  "Service Contract",
  "Intake Form",
  "Invoice",
  "Permit",
  "Other",
];

export type ExtractedFields = {
  deceased_name: string | null;
  date_of_death: string | null;
  time_of_death: string | null;
  next_of_kin_name: string | null;
  next_of_kin_relationship: string | null;
  next_of_kin_phone: string | null;
  next_of_kin_cell: string | null;
  date_of_birth: string | null;
  age: string | null;
  sex: string | null;
  place_of_death: string | null;
  cause_of_death: string | null;
  home_address: string | null;
  disposition_type: "Burial" | "Cremation" | null;
  disposition_location: string | null;
  funeral_director: string | null;
  ssn: string | null;
  marital_status: string | null;
  race: string | null;
  hispanic_origin: string | null;
  birthplace: string | null;
  occupation: string | null;
  business_industry: string | null;
  father_name: string | null;
  mother_maiden_name: string | null;
  physician_name: string | null;
  physician_phone: string | null;
  armed_forces: boolean | null;
  num_death_certificates: number | null;
  education: string | null;
  service_date: string | null;
  document_type: DocumentType | null;
  notes: string | null;
};

export type ExtractionStatus = "pending" | "complete" | "failed" | "skipped_no_api_key";

export type LibraryDocument = {
  id: string;
  familyId: string | null;
  fileName: string;
  fileType: "pdf" | "image";
  storagePath: string | null;
  uploadedAt: string;
  extractionStatus: ExtractionStatus;
  extracted: ExtractedFields;
};

export type InvoiceStatus = "paid" | "outstanding" | "overdue";

export type Invoice = {
  id: string;
  familyId: string;
  amountCents: number;
  status: InvoiceStatus;
  dueDate: string;
  description: string;
};

export type MessageChannel = "email" | "sms";
export type MessageDirection = "inbound" | "outbound";

export type InboxMessage = {
  id: string;
  familyId: string;
  channel: MessageChannel;
  direction: MessageDirection;
  preview: string;
  occurredAt: string;
  unread: boolean;
};

export type Review = {
  id: string;
  familyId: string | null;
  rating: number;
  text: string;
  occurredAt: string;
  source: "google";
  responded: boolean;
};

export function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function familyDisplayName(family: Family): string {
  return family.deceasedName ?? `${family.nextOfKinName} (pre-need)`;
}
