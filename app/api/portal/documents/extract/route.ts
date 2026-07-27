import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { extractDocumentFields } from "@/lib/portal/funeral/extraction";
import { createDocument, getFamilies } from "@/lib/portal/funeral/data";
import { convertToPdf, detectFileFormat, toPdfFileName } from "@/lib/portal/documents/convert-to-pdf";
import type { ExtractedFields } from "@/lib/portal/funeral/types";

const MAX_BYTES = 20 * 1024 * 1024; // 20MB

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
}

async function matchFamilyId(fields: ExtractedFields): Promise<string | null> {
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
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is too large (20MB max)." }, { status: 400 });
  }

  const originalBytes = Buffer.from(await file.arrayBuffer());

  // Checked from the file's actual contents, not the browser-reported
  // mediaType — that label is unreliable (some pickers mislabel HEIC as
  // image/jpeg) and trusting it previously let non-JPEG bytes reach sharp's
  // JPEG decoder.
  if (detectFileFormat(originalBytes) === "unknown") {
    return NextResponse.json(
      { error: "Unsupported file type. Upload a PDF, JPEG, PNG, WEBP, GIF, or HEIC photo." },
      { status: 400 }
    );
  }

  let pdfBytes: Uint8Array;
  try {
    ({ pdfBytes } = await convertToPdf(originalBytes, file.name));
  } catch (error) {
    return NextResponse.json(
      { error: `Couldn't process that file: ${error instanceof Error ? error.message : "unknown error"}` },
      { status: 400 }
    );
  }

  const extraction = await extractDocumentFields({
    base64: Buffer.from(pdfBytes).toString("base64"),
  });

  const pdfFileName = toPdfFileName(file.name);

  // Storage RLS (0002_funeral_tables.sql) requires the object's first path
  // segment to equal the caller's company_id — this must match exactly.
  const storagePath = `${user.company.id}/${randomUUID()}-${sanitizeFileName(pdfFileName)}`;
  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, pdfBytes, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
  }

  const familyId = await matchFamilyId(extraction.fields);

  const document = await createDocument({
    companyId: user.company.id,
    familyId,
    fileName: pdfFileName,
    fileType: "pdf",
    storagePath,
    extractionStatus: extraction.status,
    extracted: extraction.fields,
    extractionRaw: extraction.raw,
  });

  return NextResponse.json({ document });
}
