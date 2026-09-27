"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { canDownloadDraft, draftLines } from "@/lib/draft";
import { buildDraftPdf } from "@/lib/draft-pdf";
import { schemes } from "@/lib/schemes";
import type { Profile } from "@/lib/types";

export function FormDraft({
  profile,
  schemeId,
  onSchemeId,
}: {
  profile: Profile;
  schemeId: string;
  onSchemeId: (id: string) => void;
}) {
  const [name, setName] = useState(profile.name ?? "");
  const [aadhaar, setAadhaar] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [note, setNote] = useState("");

  const ready = canDownloadDraft({ confirmed, applicantName: name, schemeId });

  async function download() {
    if (!ready) return;
    const lines = draftLines({
      confirmed,
      applicantName: name,
      schemeId,
      profile: { ...profile, name },
      aadhaarLast4: aadhaar,
    });
    const blob = await draftPdf(lines);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sarkari-saathi-draft.pdf";
    link.click();
    URL.revokeObjectURL(url);
    setNote("ड्राफ्ट डाउनलोड हो गया। इसे कहीं जमा नहीं किया गया।");
  }

  return (
    <section className="panel draft">
      <h2>फ़ॉर्म ड्राफ्ट</h2>
      <p className="small">
        यह सहायता ड्राफ्ट है। डाउनलोड से पहले पुष्टि करें। सरकारी पोर्टल पर कुछ भी नहीं भेजा जाता।
      </p>
      <label>
        योजना
        <select value={schemeId} onChange={(event) => onSchemeId(event.target.value)}>
          <option value="">चुनें</option>
          {schemes.map((scheme) => (
            <option key={scheme.id} value={scheme.id}>
              {scheme.nameHi}
            </option>
          ))}
        </select>
      </label>
      <label>
        पूरा नाम
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="जैसा आधार पर है" />
      </label>
      <label>
        आधार के आखिरी 4 अंक (वैकल्पिक, केवल इस ड्राफ्ट में)
        <input
          value={aadhaar}
          inputMode="numeric"
          maxLength={4}
          onChange={(event) => setAadhaar(event.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="1234"
        />
      </label>
      <label className="check">
        <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
        <span>मैंने विवरण जाँच लिया है। यह ड्राफ्ट मेरे देखने के लिए है, आवेदन जमा नहीं करना।</span>
      </label>
      <button className="primary" disabled={!ready} onClick={download}>
        पीडीएफ़ डाउनलोड करें
      </button>
      {!ready && <p className="small">नाम, योजना और पुष्टि के बिना डाउनलोड नहीं खुलेगा।</p>}
      {note && <p>{note}</p>}
    </section>
  );
}

async function draftPdf(lines: string[]): Promise<Blob> {
  try {
    const fontResponse = await fetch("/fonts/NotoSansDevanagari-Regular.ttf");
    if (!fontResponse.ok) throw new Error("font");
    const bytes = await buildDraftPdf(new Uint8Array(await fontResponse.arrayBuffer()), lines);
    return new Blob([Uint8Array.from(bytes)], { type: "application/pdf" });
  } catch {
    return linesToPdf(lines);
  }
}

async function linesToPdf(lines: string[]): Promise<Blob> {
  const width = 794;
  const height = 1123;
  const canvas = renderOnePage(lines, width, height);
  const pdf = await PDFDocument.create();
  const png = canvas.toDataURL("image/png");
  const image = await pdf.embedPng(dataUrlToBytes(png));
  const page = pdf.addPage([595.28, 841.89]);
  page.drawImage(image, { x: 0, y: 0, width: 595.28, height: 841.89 });
  const saved = await pdf.save();
  return new Blob([Uint8Array.from(saved)], { type: "application/pdf" });
}

function renderOnePage(lines: string[], width: number, height: number): HTMLCanvasElement {
  const probe = document.createElement("canvas").getContext("2d");
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!probe || !ctx) return canvas;
  const margin = 48;
  const maxWidth = width - margin * 2;
  let fontSize = 18;
  let wrapped: string[] = [];
  let lineHeight = 26;
  while (fontSize >= 11) {
    probe.font = `${fontSize}px 'Noto Sans Devanagari', sans-serif`;
    lineHeight = Math.round(fontSize * 1.35);
    wrapped = [];
    for (const line of lines) {
      if (!line) wrapped.push("");
      else wrapped.push(...wrap(probe, line, maxWidth));
    }
    if (wrapped.length * lineHeight <= height - margin * 2) break;
    fontSize -= 1;
  }
  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#1d1a16";
  ctx.font = `${fontSize}px 'Noto Sans Devanagari', sans-serif`;
  wrapped.forEach((line, row) => {
    const y = margin + (row + 1) * lineHeight;
    if (y < height - margin / 2) ctx.fillText(line, margin, y);
  });
  return canvas;
}

function wrap(ctx: CanvasRenderingContext2D, line: string, maxWidth: number): string[] {
  const words = line.split(" ");
  const rows: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      rows.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) rows.push(current);
  return rows.length ? rows : [""];
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}
