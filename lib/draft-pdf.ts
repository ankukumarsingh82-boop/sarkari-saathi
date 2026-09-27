import "regenerator-runtime/runtime.js";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont } from "pdf-lib";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;

export async function buildDraftPdf(fontBytes: Uint8Array, lines: string[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, { subset: true });
  const maxWidth = PAGE_WIDTH - MARGIN * 2;
  const maxHeight = PAGE_HEIGHT - MARGIN * 2;
  const fitted = fitOnPage(font, lines, maxWidth, maxHeight);
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN - fitted.size;
  for (const line of fitted.lines) {
    if (line) {
      page.drawText(line, {
        x: MARGIN,
        y,
        size: fitted.size,
        font,
        color: rgb(0.114, 0.102, 0.086),
      });
    }
    y -= fitted.leading;
  }
  return pdf.save();
}

function fitOnPage(
  font: PDFFont,
  lines: string[],
  maxWidth: number,
  maxHeight: number,
): { size: number; leading: number; lines: string[] } {
  for (let size = 12; size >= 8; size -= 0.5) {
    const leading = size + 4;
    const wrapped = wrapLines(font, lines, size, maxWidth);
    if (wrapped.length * leading <= maxHeight) return { size, leading, lines: wrapped };
  }
  const size = 8;
  const wrapped = wrapLines(font, lines, size, maxWidth);
  const leading = Math.max(9, maxHeight / Math.max(wrapped.length, 1));
  if (wrapped.length * leading > maxHeight + 0.5) {
    throw new Error("draft does not fit on one page");
  }
  return { size, leading, lines: wrapped };
}

function wrapLines(font: PDFFont, lines: string[], size: number, maxWidth: number): string[] {
  const wrapped: string[] = [];
  for (const line of lines) {
    if (!line) {
      wrapped.push("");
      continue;
    }
    const words = line.split(" ");
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (current && font.widthOfTextAtSize(next, size) > maxWidth) {
        wrapped.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) wrapped.push(current);
  }
  return wrapped;
}
