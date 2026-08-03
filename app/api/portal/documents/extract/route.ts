import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { createDocument } from "@/lib/portal/funeral/data";
import {
  matchFamilyId,
  processUploadedFile,
  sanitizeFileName,
  UploadProcessingError,
  type ProcessedUpload,
} from "@/lib/portal/documents/process-upload";

export async function POST(req: NextRequest) {
  // proxy.ts already requires a session for /api/portal/**, but a missing
  // profile/company row is still possible (e.g. a mid-provisioning account)
  // — fail closed rather than proceeding without a company_id.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  // Storage RLS (0002_funeral_tables.sql) requires the object's first path
  // segment to equal the caller's company_id — this must match exactly.
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
    document = await createDocument({
      companyId: user.company.id,
      familyId,
      fileName: processed.pdfFileName,
      fileType: "pdf",
      storagePath,
      extractionStatus: processed.extraction.status,
      extracted: processed.extraction.fields,
      extractionRaw: processed.extraction.raw,
    });
  } catch (error) {
    // The file is already uploaded to storage but the row never got
    // created — clean up the orphaned upload rather than leaving it
    // stranded, and surface a real JSON error instead of letting this
    // throw all the way up into a raw, non-JSON 500 (which the client
    // can only report back as a generic "Upload failed.").
    await supabase.storage.from("documents").remove([storagePath]);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Couldn't save the document." },
      { status: 500 }
    );
  }

  return NextResponse.json({ document });
}
