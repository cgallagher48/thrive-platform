// Every document in the Library ends up as a clean PDF, regardless of
// whether the client uploaded an existing PDF or snapped a photo. PDFs pass
// through untouched; images are normalized to a JPEG and wrapped in a
// single-page PDF sized to the image.
//
// Routing is decided from the file's actual magic bytes, never from the
// browser-reported mediaType or the filename. Both are client-supplied and
// unreliable in the exact way that matters here: some browsers/OS file
// pickers mislabel HEIC photos as image/jpeg (or vice versa) instead of
// reporting image/heic. Trusting that label previously sent real HEIC bytes
// into sharp's JPEG decode path, which fails with a raw "SOI not found in
// JPEG" error — sniffing the bytes ourselves closes that gap for every
// format, not just HEIC.
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

export type DetectedFormat = "pdf" | "jpeg" | "png" | "webp" | "gif" | "heic" | "unknown";

// Major brands that show up on real-world HEIC/HEIF photos. iPhones write
// "heic" as the major brand; a handful of other encoders/brand variants are
// included for robustness.
const HEIC_BRANDS = new Set([
  "heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs", "mif1", "msf1",
]);

export function detectFileFormat(bytes: Buffer): DetectedFormat {
  if (bytes.length < 12) return "unknown";

  if (bytes.subarray(0, 4).toString("ascii") === "%PDF") return "pdf";

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";

  if (
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "png";
  }

  const gifHeader = bytes.subarray(0, 6).toString("ascii");
  if (gifHeader === "GIF87a" || gifHeader === "GIF89a") return "gif";

  if (
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }

  // ISO base media file format (HEIC/HEIF container): 4-byte box size, then
  // "ftyp", then a 4-byte major brand.
  if (bytes.subarray(4, 8).toString("ascii") === "ftyp") {
    const majorBrand = bytes.subarray(8, 12).toString("ascii");
    if (HEIC_BRANDS.has(majorBrand)) return "heic";
  }

  return "unknown";
}

export async function convertToPdf(
  bytes: Buffer,
  fileName: string
): Promise<ConversionResult> {
  const format = detectFileFormat(bytes);

  if (format === "pdf") {
    return { pdfBytes: bytes, converted: false };
  }

  if (format === "unknown") {
    throw new Error(
      `"${fileName}" doesn't look like a supported file (checked the file's actual contents, not just its name). Upload a PDF, JPEG, PNG, WEBP, GIF, or HEIC photo.`
    );
  }

  const jpegBytes: Buffer =
    format === "heic"
      ? Buffer.from(await heicConvert({ buffer: bytes, format: "JPEG", quality: 0.92 }))
      : await sharp(bytes).autoOrient().jpeg({ quality: 92 }).toBuffer();

  // pdf-lib's JpegEmbedder builds its DataView from imageData.buffer without
  // accounting for byteOffset, so it misreads the SOI marker whenever the
  // buffer we hand it is a view into Node's shared allocator pool at a
  // non-zero offset (routine for small Buffers, and exactly what
  // heic-convert's output is once other conversions have run earlier in the
  // same process). Wrapping in `new Uint8Array(...)` forces a fresh,
  // exactly-sized ArrayBuffer at offset 0, which sidesteps the bug.
  const pdfDoc = await PDFDocument.create();
  const jpgImage = await pdfDoc.embedJpg(new Uint8Array(jpegBytes));

  // The PDF page size is declared in points (72/inch), NOT pixels. A modern
  // phone photo's pixel dimensions (e.g. 3024x4032) used directly as point
  // dimensions produces an absurd 42"x56" virtual page. Viewers that render
  // near "actual size" instead of aggressively fitting to their container
  // — routine for PDFs embedded in a small <iframe>, which is exactly how
  // this shows up in the Company Files preview — then display only a tiny,
  // dark, massively zoomed-in corner of that oversized page instead of the
  // full document. Scaling to a plausible scan DPI keeps the page a sane
  // physical size for viewers to fit correctly, with zero loss of
  // resolution: the embedded image's actual pixel data is untouched, only
  // its declared page size changes.
  const ASSUMED_SCAN_DPI = 300;
  const pageWidth = (jpgImage.width / ASSUMED_SCAN_DPI) * 72;
  const pageHeight = (jpgImage.height / ASSUMED_SCAN_DPI) * 72;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  page.drawImage(jpgImage, { x: 0, y: 0, width: pageWidth, height: pageHeight });

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
