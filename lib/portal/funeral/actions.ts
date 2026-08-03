"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { updateDocument, updateFieldPrefs } from "./data";
import { DOCUMENT_TYPES, type DocumentType, type ExtractedFields } from "./types";
import { FIELD_DEFS } from "./field-schema";

export type UpdateDocumentState = {
  error: string | null;
  savedAt: number | null;
};

function textOrNull(formData: FormData, name: string): string | null {
  const value = String(formData.get(name) ?? "").trim();
  return value || null;
}

export async function updateDocumentFields(
  _prevState: UpdateDocumentState,
  formData: FormData
): Promise<UpdateDocumentState> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Missing document id.", savedAt: null };
  }

  const documentTypeRaw = String(formData.get("document_type") ?? "");
  const documentType = (DOCUMENT_TYPES as string[]).includes(documentTypeRaw)
    ? (documentTypeRaw as DocumentType)
    : null;

  const dispositionRaw = String(formData.get("disposition_type") ?? "");
  const dispositionType: ExtractedFields["disposition_type"] =
    dispositionRaw === "Burial" || dispositionRaw === "Cremation" ? dispositionRaw : null;

  const armedForcesRaw = String(formData.get("armed_forces") ?? "");
  const armedForces = armedForcesRaw === "yes" ? true : armedForcesRaw === "no" ? false : null;

  const numCertsRaw = String(formData.get("num_death_certificates") ?? "").trim();
  const parsedCerts = numCertsRaw ? Number(numCertsRaw) : NaN;
  const numDeathCertificates = Number.isFinite(parsedCerts) ? Math.trunc(parsedCerts) : null;

  const fields: ExtractedFields = {
    deceased_name: textOrNull(formData, "deceased_name"),
    date_of_death: textOrNull(formData, "date_of_death"),
    time_of_death: textOrNull(formData, "time_of_death"),
    next_of_kin_name: textOrNull(formData, "next_of_kin_name"),
    next_of_kin_relationship: textOrNull(formData, "next_of_kin_relationship"),
    next_of_kin_phone: textOrNull(formData, "next_of_kin_phone"),
    next_of_kin_cell: textOrNull(formData, "next_of_kin_cell"),
    date_of_birth: textOrNull(formData, "date_of_birth"),
    age: textOrNull(formData, "age"),
    sex: textOrNull(formData, "sex"),
    place_of_death: textOrNull(formData, "place_of_death"),
    cause_of_death: textOrNull(formData, "cause_of_death"),
    home_address: textOrNull(formData, "home_address"),
    disposition_type: dispositionType,
    disposition_location: textOrNull(formData, "disposition_location"),
    funeral_director: textOrNull(formData, "funeral_director"),
    ssn: textOrNull(formData, "ssn"),
    marital_status: textOrNull(formData, "marital_status"),
    race: textOrNull(formData, "race"),
    hispanic_origin: textOrNull(formData, "hispanic_origin"),
    birthplace: textOrNull(formData, "birthplace"),
    occupation: textOrNull(formData, "occupation"),
    business_industry: textOrNull(formData, "business_industry"),
    father_name: textOrNull(formData, "father_name"),
    mother_maiden_name: textOrNull(formData, "mother_maiden_name"),
    physician_name: textOrNull(formData, "physician_name"),
    physician_phone: textOrNull(formData, "physician_phone"),
    armed_forces: armedForces,
    num_death_certificates: numDeathCertificates,
    education: textOrNull(formData, "education"),
    service_date: textOrNull(formData, "service_date"),
    document_type: documentType,
    notes: textOrNull(formData, "notes"),
  };

  try {
    await updateDocument(id, fields);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Save failed.", savedAt: null };
  }

  revalidatePath("/dashboard/library");
  return { error: null, savedAt: Date.now() };
}

const VALID_FIELD_KEYS = new Set(FIELD_DEFS.map((f) => f.key as string));

// Persists a company's custom "At a Glance" field order. Called directly
// from the client component (not through a <form action>) since it's a
// simple imperative save, same pattern as the delete/replace handlers in
// DocumentDetail already use for their own API calls.
export async function saveGlanceFieldOrder(order: string[]): Promise<{ error: string | null }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized." };
  }

  if (!Array.isArray(order) || !order.every((key) => typeof key === "string" && VALID_FIELD_KEYS.has(key))) {
    return { error: "Invalid field selection." };
  }

  try {
    await updateFieldPrefs(user.company.id, order);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Save failed." };
  }

  revalidatePath("/dashboard/library");
  return { error: null };
}
