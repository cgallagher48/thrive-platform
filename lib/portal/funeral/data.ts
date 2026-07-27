// Real data-access layer for the funeral vertical. Every query here goes
// through the session-bound Supabase client (lib/supabase/server.ts) — never
// the service-role client — so Postgres RLS (see
// supabase/migrations/0002_funeral_tables.sql) is what actually confines
// every read and write to the caller's own company. Reads don't need an
// explicit company_id filter for that reason; RLS applies it transparently.
// Writes still set company_id explicitly, since the column is NOT NULL and
// the RLS WITH CHECK clause requires it to match the caller's company.

import { createClient } from "@/lib/supabase/server";
import type {
  Family,
  Service,
  LibraryDocument,
  Invoice,
  InboxMessage,
  Review,
  ExtractedFields,
  DocumentType,
} from "./types";

function mapFamilyRow(row: Record<string, unknown>): Family {
  return {
    id: row.id as string,
    deceasedName: (row.deceased_name as string | null) ?? null,
    nextOfKinName: row.next_of_kin_name as string,
    phone: (row.phone as string | null) ?? "",
    email: (row.email as string | null) ?? "",
    status: row.status as Family["status"],
    createdAt: row.created_at as string,
  };
}

function mapServiceRow(row: Record<string, unknown>): Service {
  return {
    id: row.id as string,
    familyId: row.family_id as string,
    serviceType: row.service_type as Service["serviceType"],
    serviceDate: row.service_date as string,
    location: (row.location as string | null) ?? "",
    notes: (row.notes as string | null) ?? "",
    status: row.status as Service["status"],
  };
}

function mapDocumentRow(row: Record<string, unknown>): LibraryDocument {
  const extracted: ExtractedFields = {
    deceased_name: (row.deceased_name as string | null) ?? null,
    family_name: (row.family_name as string | null) ?? null,
    phone_numbers: (row.phone_numbers as string[] | null) ?? null,
    service_date: (row.service_date as string | null) ?? null,
    document_type: (row.document_type as ExtractedFields["document_type"]) ?? null,
    address: (row.address as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
  };
  return {
    id: row.id as string,
    familyId: (row.family_id as string | null) ?? null,
    fileName: row.file_name as string,
    fileType: row.file_type as LibraryDocument["fileType"],
    storagePath: (row.storage_path as string | null) ?? null,
    uploadedAt: row.uploaded_at as string,
    extractionStatus: row.extraction_status as LibraryDocument["extractionStatus"],
    extracted,
  };
}

function mapInvoiceRow(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    familyId: row.family_id as string,
    amountCents: row.amount_cents as number,
    status: row.status as Invoice["status"],
    dueDate: (row.due_date as string | null) ?? "",
    description: (row.description as string | null) ?? "",
  };
}

function mapMessageRow(row: Record<string, unknown>): InboxMessage {
  return {
    id: row.id as string,
    familyId: row.family_id as string,
    channel: row.channel as InboxMessage["channel"],
    direction: row.direction as InboxMessage["direction"],
    preview: (row.preview as string | null) ?? "",
    occurredAt: row.occurred_at as string,
    unread: row.unread as boolean,
  };
}

function mapReviewRow(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    familyId: (row.family_id as string | null) ?? null,
    rating: row.rating as number,
    text: (row.text as string | null) ?? "",
    occurredAt: row.occurred_at as string,
    source: "google",
    responded: row.responded as boolean,
  };
}

export async function getFamilies(): Promise<Family[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("families").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`getFamilies: ${error.message}`);
  return (data ?? []).map(mapFamilyRow);
}

export async function getFamily(id: string): Promise<Family | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("families").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getFamily: ${error.message}`);
  return data ? mapFamilyRow(data) : undefined;
}

export async function getServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("services").select("*").order("service_date", { ascending: true });
  if (error) throw new Error(`getServices: ${error.message}`);
  return (data ?? []).map(mapServiceRow);
}

export async function getServicesForFamily(familyId: string): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("family_id", familyId)
    .order("service_date", { ascending: true });
  if (error) throw new Error(`getServicesForFamily: ${error.message}`);
  return (data ?? []).map(mapServiceRow);
}

export async function getDocuments(): Promise<LibraryDocument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("documents").select("*").order("uploaded_at", { ascending: false });
  if (error) throw new Error(`getDocuments: ${error.message}`);
  return (data ?? []).map(mapDocumentRow);
}

export async function getDocument(id: string): Promise<LibraryDocument | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("documents").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getDocument: ${error.message}`);
  return data ? mapDocumentRow(data) : undefined;
}

export async function getDocumentsForFamily(familyId: string): Promise<LibraryDocument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("family_id", familyId)
    .order("uploaded_at", { ascending: false });
  if (error) throw new Error(`getDocumentsForFamily: ${error.message}`);
  return (data ?? []).map(mapDocumentRow);
}

export async function getInvoices(): Promise<Invoice[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("invoices").select("*").order("due_date", { ascending: true });
  if (error) throw new Error(`getInvoices: ${error.message}`);
  return (data ?? []).map(mapInvoiceRow);
}

export async function getInvoicesForFamily(familyId: string): Promise<Invoice[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("family_id", familyId)
    .order("due_date", { ascending: true });
  if (error) throw new Error(`getInvoicesForFamily: ${error.message}`);
  return (data ?? []).map(mapInvoiceRow);
}

export async function getMessages(): Promise<InboxMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("messages").select("*").order("occurred_at", { ascending: false });
  if (error) throw new Error(`getMessages: ${error.message}`);
  return (data ?? []).map(mapMessageRow);
}

export async function getMessagesForFamily(familyId: string): Promise<InboxMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("family_id", familyId)
    .order("occurred_at", { ascending: false });
  if (error) throw new Error(`getMessagesForFamily: ${error.message}`);
  return (data ?? []).map(mapMessageRow);
}

export async function getReviews(): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("reviews").select("*").order("occurred_at", { ascending: false });
  if (error) throw new Error(`getReviews: ${error.message}`);
  return (data ?? []).map(mapReviewRow);
}

// --- Writes -----------------------------------------------------------

export type NewDocumentInput = {
  companyId: string;
  familyId: string | null;
  fileName: string;
  fileType: "pdf" | "image";
  storagePath: string;
  extractionStatus: LibraryDocument["extractionStatus"];
  extracted: ExtractedFields;
  extractionRaw?: unknown;
};

export async function createDocument(input: NewDocumentInput): Promise<LibraryDocument> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .insert({
      company_id: input.companyId,
      family_id: input.familyId,
      file_name: input.fileName,
      file_type: input.fileType,
      storage_path: input.storagePath,
      extraction_status: input.extractionStatus,
      extraction_raw: input.extractionRaw ?? null,
      deceased_name: input.extracted.deceased_name,
      family_name: input.extracted.family_name,
      phone_numbers: input.extracted.phone_numbers,
      service_date: input.extracted.service_date,
      document_type: input.extracted.document_type,
      address: input.extracted.address,
      notes: input.extracted.notes,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(`createDocument: ${error?.message ?? "insert failed"}`);
  return mapDocumentRow(data);
}

export type DocumentCorrectionInput = {
  documentType: DocumentType | null;
  deceasedName: string | null;
  familyName: string | null;
  phoneNumbers: string[] | null;
  serviceDate: string | null;
};

// Manual corrections to a document's category and extracted fields — the
// same columns createDocument sets from the AI extraction, but overwritten
// by a human. RLS's own WITH CHECK (company_id = current_company_id())
// still applies to this update, even though we don't touch company_id here.
export async function updateDocument(
  id: string,
  input: DocumentCorrectionInput
): Promise<LibraryDocument> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .update({
      document_type: input.documentType,
      deceased_name: input.deceasedName,
      family_name: input.familyName,
      phone_numbers: input.phoneNumbers,
      service_date: input.serviceDate,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw new Error(`updateDocument: ${error?.message ?? "update failed"}`);
  return mapDocumentRow(data);
}

export async function getDocumentSignedUrl(storagePath: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("documents").createSignedUrl(storagePath, 60 * 10);
  if (error) return null;
  return data.signedUrl;
}

// Row delete only — the caller is responsible for removing the associated
// storage object (see app/api/portal/documents/[id]/route.ts), since storage
// operations live at the route layer for every other document flow too.
export async function deleteDocument(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw new Error(`deleteDocument: ${error.message}`);
}

export type DocumentReplaceInput = {
  familyId: string | null;
  fileName: string;
  fileType: "pdf" | "image";
  storagePath: string;
  extractionStatus: LibraryDocument["extractionStatus"];
  extracted: ExtractedFields;
  extractionRaw?: unknown;
};

// Retake/replace: same row, new file and freshly extracted fields. The
// caller uploads the new file to a new storage path and removes the old one
// (see the route) — this just swaps the row over to point at it.
export async function replaceDocument(
  id: string,
  input: DocumentReplaceInput
): Promise<LibraryDocument> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .update({
      family_id: input.familyId,
      file_name: input.fileName,
      file_type: input.fileType,
      storage_path: input.storagePath,
      extraction_status: input.extractionStatus,
      extraction_raw: input.extractionRaw ?? null,
      deceased_name: input.extracted.deceased_name,
      family_name: input.extracted.family_name,
      phone_numbers: input.extracted.phone_numbers,
      service_date: input.extracted.service_date,
      document_type: input.extracted.document_type,
      address: input.extracted.address,
      notes: input.extracted.notes,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw new Error(`replaceDocument: ${error?.message ?? "update failed"}`);
  return mapDocumentRow(data);
}
