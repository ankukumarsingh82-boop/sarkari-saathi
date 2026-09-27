import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "सरकारी साथी · Sarkari Saathi",
  description: "Hindi voice and text assistant for Indian government schemes. Eligibility, documents, and a confirmed form draft.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  );
}
