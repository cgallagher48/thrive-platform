// Shared by both the initial upload (app/api/portal/documents/extract) and
// the retake/replace flow (app/api/portal/documents/[id]) — same file
// validation, conversion, and AI extraction either way.

import { convertToPdf, detectFileFormat, toPdfFileName } from "./convert-to-pdf";
import { extractDocumentFields, type ExtractionResult } from "@/lib/portal/funeral/extraction";
import { getFamilies } from "@/lib/portal/funeral/data";
import type { ExtractedFields } from "@/lib/portal/funeral/types";

const MAX_BYTES = 20 * 1024 * 1024; // 20MB

export class UploadProcessingError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
}

export type ProcessedUpload = {
  pdfBytes: Uint8Array;
  pdfFileName: string;
  extraction: ExtractionResult;
};

export async function processUploadedFile(file: File): Promise<ProcessedUpload> {
  if (file.size > MAX_BYTES) {
    throw new UploadProcessingError("File is too large (20MB max).");
  }

  const originalBytes = Buffer.from(await file.arrayBuffer());

  // Checked from the file's actual contents, not the browser-reported
  // mediaType — that label is unreliable (some pickers mislabel HEIC as
  // image/jpeg) and trusting it previously let non-JPEG bytes reach sharp's
  // JPEG decoder.
  if (detectFileFormat(originalBytes) === "unknown") {
    throw new UploadProcessingError(
      "Unsupported file type. Upload a PDF, JPEG, PNG, WEBP, GIF, or HEIC photo."
    );
  }

  let pdfBytes: Uint8Array;
  try {
    ({ pdfBytes } = await convertToPdf(originalBytes, file.name));
  } catch (error) {
    throw new UploadProcessingError(
      `Couldn't process that file: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }

  const extraction = await extractDocumentFields({
    base64: Buffer.from(pdfBytes).toString("base64"),
  });

  return { pdfBytes, pdfFileName: toPdfFileName(file.name), extraction };
}

// Best-effort match against existing families by name — used to link a
// newly (re-)extracted document to a family record when one exists.
export async function matchFamilyId(fields: ExtractedFields): Promise<string | null> {
  const needle = (fields.deceased_name ?? fields.family_name ?? "").toLowerCase();
  if (!needle) return null;
  const families = await getFamilies();
  const match = families.find(
    (f) =>
      (f.deceasedName && needle.includes(f.deceasedName.toLowerCase())) ||
      needle.includes(f.nextOfKinName.toLowerCase())
  );
  return match?.id ?? null;
}
