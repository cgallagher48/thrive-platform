// Client-side resize/recompress applied right before upload, in the
// browser — separate from (and much lighter than) the Phase 2 crop/deskew
// work. This exists to fix a real, separate bug: Vercel Functions cap the
// request body at 4.5MB, but our own upload validation allows up to 20MB —
// so any photo in that gap was silently failing with a platform-level 413
// before our code ever ran. A full-resolution modern phone photo (often
// 8-12MB+) routinely lands in that gap; a resized, recompressed one
// almost never does.
//
// Runs only on image files above MIN_SIZE_TO_COMPRESS; PDFs and
// already-small images pass through untouched. If the browser can't
// decode the file client-side (e.g. HEIC on a non-Apple platform —
// Safari/iOS decodes HEIC natively via createImageBitmap, most others
// don't), this falls back to the original file rather than failing the
// upload: the server-side pipeline (heic-convert / sharp) still handles
// it, just without this safety margin.

const MAX_DIMENSION = 2200; // px, longest side — plenty for a document to stay legible/OCR-able
const MIN_SIZE_TO_COMPRESS = 1.5 * 1024 * 1024; // below this, not worth the CPU/quality cost
const SAFETY_BYTE_LIMIT = 4 * 1024 * 1024; // margin under Vercel's 4.5MB function body cap
const QUALITY_STEPS = [0.85, 0.7, 0.55];

export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= MIN_SIZE_TO_COMPRESS) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    let lastBlob: Blob | null = null;
    for (const quality of QUALITY_STEPS) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (!blob) continue;
      lastBlob = blob;
      if (blob.size <= SAFETY_BYTE_LIMIT) break;
    }
    if (!lastBlob) return file;

    return new File([lastBlob], toJpegName(file.name), { type: "image/jpeg" });
  } catch {
    return file;
  }
}

function toJpegName(originalName: string): string {
  const withoutExt = originalName.replace(/\.[^./\\]+$/, "");
  return `${withoutExt || originalName}.jpg`;
}
