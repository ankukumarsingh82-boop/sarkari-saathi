"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { canDownloadDraft, draftLines } from "@/lib/draft";
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
    const blob = await linesToPdf(lines);
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

async function linesToPdf(lines: string[]): Promise<Blob> {
  const width = 794;
  const height = 1123;
  const pages = paginate(lines, width, height);
  const pdf = await PDFDocument.create();
  for (const canvas of pages) {
    const png = canvas.toDataURL("image/png");
    const bytes = dataUrlToBytes(png);
    const image = await pdf.embedPng(bytes);
    const page = pdf.addPage([595.28, 841.89]);
    page.drawImage(image, { x: 0, y: 0, width: 595.28, height: 841.89 });
  }
  const saved = await pdf.save();
  return new Blob([Uint8Array.from(saved)], { type: "application/pdf" });
}

function paginate(lines: string[], width: number, height: number): HTMLCanvasElement[] {
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) return [];
  probe.font = "22px 'Noto Sans Devanagari', sans-serif";
  const margin = 48;
  const maxWidth = width - margin * 2;
  const wrapped: string[] = [];
  for (const line of lines) {
    if (!line) {
      wrapped.push("");
      continue;
    }
    wrapped.push(...wrap(probe, line, maxWidth));
  }
  const lineHeight = 32;
  const perPage = Math.floor((height - margin * 2) / lineHeight);
  const canvases: HTMLCanvasElement[] = [];
  for (let index = 0; index < wrapped.length; index += perPage) {
    const slice = wrapped.slice(index, index + perPage);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#1d1a16";
    ctx.font = "22px 'Noto Sans Devanagari', sans-serif";
    slice.forEach((line, row) => {
      ctx.fillText(line, margin, margin + (row + 1) * lineHeight);
    });
    canvases.push(canvas);
  }
  return canvases.length ? canvases : [blank(width, height)];
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

function blank(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
  }
  return canvas;
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}
