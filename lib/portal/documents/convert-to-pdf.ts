// Every document in the Library ends up as a clean PDF, regardless of
// whether the client uploaded an existing PDF or snapped a photo. PDFs pass
// through untouched; images are normalized to a JPEG and wrapped in a
// single-page PDF sized to the image.
//
// HEIC/HEIF (the default format for iPhone photos — exactly what "take a
// photo directly" produces on a lot of devices) is handled by heic-convert
// rather than sharp's native HEIC decode. Sharp's HEIC support depends on
// how its bundled libvips was built and is inconsistent across platforms —
// including gaps on common serverless hosts — so heic-convert (pure JS/WASM,
// no native binary) is the more reliable path for that one format
// specifically. Every other image format goes through sharp.

import sharp from "sharp";
import heicConvert from "heic-convert";
import { PDFDocument } from "pdf-lib";

export type ConversionResult = {
  pdfBytes: Uint8Array;
  // false when the input was already a PDF and passed through unchanged.
  converted: boolean;
};

const HEIC_MEDIA_TYPES = new Set(["image/heic", "image/heif"]);

function looksLikeHeic(mediaType: string, fileName: string): boolean {
  if (HEIC_MEDIA_TYPES.has(mediaType.toLowerCase())) return true;
  // Some browsers report a generic type for HEIC files instead of
  // image/heic — fall back to the file extension in that case.
  if (!mediaType || mediaType === "application/octet-stream") {
    return /\.(heic|heif)$/i.test(fileName);
  }
  return false;
}

export async function convertToPdf(
  bytes: Buffer,
  mediaType: string,
  fileName: string
): Promise<ConversionResult> {
  if (mediaType === "application/pdf") {
    return { pdfBytes: bytes, converted: false };
  }

  const jpegBytes: Buffer = looksLikeHeic(mediaType, fileName)
    ? Buffer.from(await heicConvert({ buffer: bytes, format: "JPEG", quality: 0.92 }))
    : await sharp(bytes).autoOrient().jpeg({ quality: 92 }).toBuffer();

  const pdfDoc = await PDFDocument.create();
  const jpgImage = await pdfDoc.embedJpg(jpegBytes);
  const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
  page.drawImage(jpgImage, { x: 0, y: 0, width: jpgImage.width, height: jpgImage.height });

  const pdfBytes = await pdfDoc.save();
  return { pdfBytes, converted: true };
}

// Swaps whatever extension the original file had for .pdf, since that's
// what's actually stored now — the Library should never show a client a
// filename that doesn't match what they'd get if they downloaded it.
export function toPdfFileName(originalFileName: string): string {
  const withoutExt = originalFileName.replace(/\.[^./\\]+$/, "");
  return `${withoutExt || originalFileName}.pdf`;
}
