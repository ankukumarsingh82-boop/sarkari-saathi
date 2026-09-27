import assert from "node:assert/strict";
import test from "node:test";
import {
  clearOfficialUpdateCache,
  expireOfficialUpdateCache,
  filterOfficialUpdates,
  isOfficialGovernmentUrl,
  searchOfficialUpdates,
} from "../lib/official-updates";
import { stalledFetch, withEnv } from "./helpers";

test("only government hosts are kept", () => {
  assert.equal(isOfficialGovernmentUrl("https://www.pmkisan.gov.in/path"), true);
  assert.equal(isOfficialGovernmentUrl("https://nsap.nic.in/"), true);
  assert.equal(isOfficialGovernmentUrl("https://gov.in/page"), true);
  assert.equal(isOfficialGovernmentUrl("https://example.com/gov.in"), false);
  assert.equal(isOfficialGovernmentUrl("https://gov.in.evil.com/"), false);
  assert.equal(isOfficialGovernmentUrl("https://notgov.in/"), false);
  assert.equal(isOfficialGovernmentUrl("javascript:alert(1)"), false);
  const updates = filterOfficialUpdates(
    ["pm-kisan"],
    {
      data: [
        { title: "Blog", url: "https://example.com/pm-kisan" },
        { title: "Portal", url: "https://www.pmkisan.gov.in/update" },
        { title: "PIB", url: "https://www.pib.gov.in/PressRelease" },
        { title: "<b>NIC</b>", url: "https://nsap.nic.in/note" },
        { title: "Extra", url: "https://financialservices.gov.in/extra" },
      ],
    },
  );
  assert.deepEqual(
    updates.map((item) => item.url),
    ["https://www.pmkisan.gov.in/update", "https://www.pib.gov.in/PressRelease", "https://nsap.nic.in/note"],
  );
  assert.equal(updates[0]?.schemeId, "pm-kisan");
  assert.equal(updates[2]?.title, "NIC");
});

test("search caches government links and falls back on failure or timeout", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
    clearOfficialUpdateCache();
  });
  clearOfficialUpdateCache();
  await withEnv({ FIRECRAWL_API_KEY: undefined }, async () => {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response("{}", { status: 200 });
    }) as typeof fetch;
    assert.deepEqual(await searchOfficialUpdates(["pm-kisan"]), []);
    assert.equal(called, false);
  });
  await withEnv({ FIRECRAWL_API_KEY: "fc-test" }, async () => {
    let calls = 0;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls += 1;
      assert.equal(String(input), "https://api.firecrawl.dev/v1/search");
      assert.equal(new Headers(init?.headers).get("authorization"), "Bearer fc-test");
      const body = JSON.parse(String(init?.body)) as { query: string; timeout: number };
      assert.match(body.query, /PM-KISAN/);
      assert.match(body.query, /site:gov\.in/);
      assert.match(body.query, /site:nic\.in/);
      assert.ok(body.timeout <= 4000);
      return new Response(
        JSON.stringify({
          success: true,
          data: [
            { title: "Official", url: "https://www.pmkisan.gov.in/news" },
            { title: "Spam", url: "https://news.example/pmkisan" },
          ],
        }),
        { status: 200 },
      );
    }) as typeof fetch;
    const first = await searchOfficialUpdates(["pm-kisan"]);
    const second = await searchOfficialUpdates(["pm-kisan"]);
    assert.equal(calls, 1);
    assert.equal(first.length, 1);
    assert.equal(first[0]?.url, "https://www.pmkisan.gov.in/news");
    assert.deepEqual(second, first);

    expireOfficialUpdateCache();
    await searchOfficialUpdates(["pm-kisan"]);
    assert.equal(calls, 2);

    clearOfficialUpdateCache();
    globalThis.fetch = (async () => new Response("no", { status: 500 })) as typeof fetch;
    assert.deepEqual(await searchOfficialUpdates(["pm-kisan"]), []);

    globalThis.fetch = stalledFetch as typeof fetch;
    assert.deepEqual(await searchOfficialUpdates(["pmuy"], { timeoutMs: 30 }), []);
  });
});
