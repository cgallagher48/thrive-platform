import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { deleteDocument, getDocument, replaceDocument } from "@/lib/portal/funeral/data";
import {
  matchFamilyId,
  processUploadedFile,
  sanitizeFileName,
  UploadProcessingError,
  type ProcessedUpload,
} from "@/lib/portal/documents/process-upload";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  // RLS scopes this to the caller's own company, so a cross-tenant id just
  // comes back as "not found" rather than leaking existence.
  const doc = await getDocument(id);
  if (!doc) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const supabase = await createClient();
  if (doc.storagePath) {
    const { error: storageError } = await supabase.storage.from("documents").remove([doc.storagePath]);
    if (storageError) {
      return NextResponse.json({ error: `Couldn't delete the file: ${storageError.message}` }, { status: 500 });
    }
  }

  try {
    await deleteDocument(id);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Couldn't delete the document." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// Retake/replace — same document record, new file. Runs the new file through
// the same convert-to-PDF + extraction pipeline as a fresh upload, then
// swaps the row over to the new file and re-extracted fields.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getDocument(id);
  if (!existing) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  let processed: ProcessedUpload;
  try {
    processed = await processUploadedFile(file);
  } catch (error) {
    const status = error instanceof UploadProcessingError ? error.status : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Couldn't process that file." },
      { status }
    );
  }

  const storagePath = `${user.company.id}/${randomUUID()}-${sanitizeFileName(processed.pdfFileName)}`;
  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, processed.pdfBytes, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
  }

  const familyId = await matchFamilyId(processed.extraction.fields);

  let document;
  try {
    document = await replaceDocument(id, {
      familyId,
      fileName: processed.pdfFileName,
      fileType: "pdf",
      storagePath,
      extractionStatus: processed.extraction.status,
      extracted: processed.extraction.fields,
      extractionRaw: processed.extraction.raw,
    });
  } catch (error) {
    // The new file is already uploaded but the row swap failed — clean up
    // the orphaned upload rather than leaving it stranded.
    await supabase.storage.from("documents").remove([storagePath]);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Couldn't save the replacement." },
      { status: 500 }
    );
  }

  // Best-effort cleanup of the old file — the row is already correctly
  // updated at this point, so a failure here is a harmless orphan, not
  // something worth failing the request over.
  if (existing.storagePath) {
    await supabase.storage.from("documents").remove([existing.storagePath]);
  }

  return NextResponse.json({ document });
}
