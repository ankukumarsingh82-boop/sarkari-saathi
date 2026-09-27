import { schemes } from "@/lib/schemes";

export async function GET() {
  return Response.json({
    checkedOn: "2026-09-27",
    count: schemes.length,
    schemes: schemes.map((scheme) => ({
      id: scheme.id,
      nameHi: scheme.nameHi,
      nameEn: scheme.nameEn,
      ministry: scheme.ministry,
      summaryHi: scheme.summaryHi,
      summaryEn: scheme.summaryEn,
      benefitHi: scheme.benefitHi,
      benefitEn: scheme.benefitEn,
      eligibilityHi: scheme.eligibilityHi,
      eligibilityEn: scheme.eligibilityEn,
      documentsHi: scheme.documentsHi,
      documentsEn: scheme.documentsEn,
      officialUrl: scheme.officialUrl,
      sourceUrl: scheme.sourceUrl,
      sourceCheckedOn: scheme.sourceCheckedOn,
      helpline: scheme.helpline ?? null,
    })),
  });
}
