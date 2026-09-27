import { fetchWithTimeout } from "./http";
import { getScheme } from "./schemes";

export interface OfficialUpdate {
  title: string;
  url: string;
  schemeId?: string;
}

interface CacheEntry {
  at: number;
  items: OfficialUpdate[];
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 10 * 60 * 1000;

export function clearOfficialUpdateCache(): void {
  cache.clear();
}

export function expireOfficialUpdateCache(): void {
  for (const entry of cache.values()) entry.at = 0;
}

export function isOfficialGovernmentUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (url.username || url.password) return false;
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    return host === "gov.in" || host.endsWith(".gov.in") || host === "nic.in" || host.endsWith(".nic.in");
  } catch {
    return false;
  }
}

function schemeHost(schemeId: string): string | null {
  const scheme = getScheme(schemeId);
  if (!scheme) return null;
  try {
    return new URL(scheme.officialUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function officialSearchQuery(schemeIds: string[]): string {
  const names: string[] = [];
  const sites = new Set<string>(["site:gov.in", "site:nic.in"]);
  for (const id of schemeIds) {
    const scheme = getScheme(id);
    if (!scheme) continue;
    names.push(`"${scheme.nameEn}"`);
    const host = schemeHost(id);
    if (host) sites.add(`site:${host}`);
  }
  return `${names.join(" OR ")} (${[...sites].join(" OR ")})`;
}

function cleanTitle(value: unknown, url: string): string {
  const title = typeof value === "string" ? value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";
  if (title) return title.slice(0, 160);
  try {
    return new URL(url).hostname;
  } catch {
    return url.slice(0, 160);
  }
}

function readRows(payload: unknown): { title?: unknown; url?: unknown }[] {
  if (!payload || typeof payload !== "object") return [];
  const record = payload as { data?: unknown; web?: unknown };
  const list = Array.isArray(record.data) ? record.data : Array.isArray(record.web) ? record.web : [];
  return list.filter((item) => item && typeof item === "object") as { title?: unknown; url?: unknown }[];
}

function hostMatches(url: string, host: string): boolean {
  try {
    const name = new URL(url).hostname.toLowerCase();
    return name === host || name.endsWith(`.${host}`);
  } catch {
    return false;
  }
}

export function filterOfficialUpdates(schemeIds: string[], payload: unknown, limit = 3): OfficialUpdate[] {
  const seen = new Set<string>();
  const updates: OfficialUpdate[] = [];
  for (const row of readRows(payload)) {
    if (typeof row.url !== "string" || !isOfficialGovernmentUrl(row.url)) continue;
    const url = row.url.trim();
    if (seen.has(url)) continue;
    seen.add(url);
    const schemeId = schemeIds.find((id) => {
      const host = schemeHost(id);
      return host ? hostMatches(url, host) : false;
    });
    updates.push({ title: cleanTitle(row.title, url), url, schemeId });
    if (updates.length >= limit) break;
  }
  return updates;
}

export async function searchOfficialUpdates(
  schemeIds: string[],
  options?: { timeoutMs?: number; ttlMs?: number },
): Promise<OfficialUpdate[]> {
  const ids = [...new Set(schemeIds.filter((id) => getScheme(id)))].slice(0, 3);
  if (!process.env.FIRECRAWL_API_KEY || ids.length === 0) return [];
  const key = ids.slice().sort().join(",");
  const ttl = options?.ttlMs ?? DEFAULT_TTL_MS;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < ttl) return cached.items;
  const timeoutMs = options?.timeoutMs ?? 4000;
  try {
    const response = await fetchWithTimeout(
      "https://api.firecrawl.dev/v1/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        },
        body: JSON.stringify({
          query: officialSearchQuery(ids),
          limit: 8,
          timeout: Math.max(1000, timeoutMs - 500),
          country: "in",
        }),
      },
      timeoutMs,
    );
    if (!response.ok) {
      await response.body?.cancel();
      return [];
    }
    const items = filterOfficialUpdates(ids, await response.json());
    cache.set(key, { at: Date.now(), items });
    return items;
  } catch {
    return [];
  }
}
