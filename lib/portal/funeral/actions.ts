"use server";

import { revalidatePath } from "next/cache";
import { updateDocument } from "./data";
import { DOCUMENT_TYPES, type DocumentType } from "./types";

export type UpdateDocumentState = {
  error: string | null;
  savedAt: number | null;
};

function parsePhoneNumbers(raw: string): string[] | null {
  const numbers = raw
    .split(/[,\n]/)
    .map((n) => n.trim())
    .filter(Boolean);
  return numbers.length > 0 ? numbers : null;
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

  try {
    await updateDocument(id, {
      documentType,
      deceasedName: String(formData.get("deceased_name") ?? "").trim() || null,
      familyName: String(formData.get("family_name") ?? "").trim() || null,
      phoneNumbers: parsePhoneNumbers(String(formData.get("phone_numbers") ?? "")),
      serviceDate: String(formData.get("service_date") ?? "").trim() || null,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Save failed.", savedAt: null };
  }

  revalidatePath("/dashboard/library");
  return { error: null, savedAt: Date.now() };
}
