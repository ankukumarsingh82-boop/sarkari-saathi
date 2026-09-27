import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../app/api/health/route";
import { POST as stt } from "../app/api/speech/stt/route";
import { POST as updates } from "../app/api/updates/route";
import { withEnv } from "./helpers";

test("health reports which integrations are configured and hides key values", async () => {
  await withEnv(
    {
      GEMINI_API_KEY: "AQ.secret-gemini",
      SARVAM_API_KEY: "secret-sarvam",
      FIRECRAWL_API_KEY: undefined,
      OPENAI_API_KEY: undefined,
    },
    async () => {
      const body = await (await GET()).json();
      assert.equal(body.ok, true);
      assert.equal(body.gemini, true);
      assert.equal(body.sarvam, true);
      assert.equal(body.search, false);
      assert.equal(body.mode, "gemini");
      assert.equal(body.keyless, false);
      assert.equal(JSON.stringify(body).includes("secret"), false);
    },
  );
  await withEnv(
    { GEMINI_API_KEY: undefined, SARVAM_API_KEY: undefined, FIRECRAWL_API_KEY: "fc-secret", OPENAI_API_KEY: undefined },
    async () => {
      const body = await (await GET()).json();
      assert.equal(body.gemini, false);
      assert.equal(body.sarvam, false);
      assert.equal(body.search, true);
      assert.equal(body.mode, "local");
      assert.equal(body.keyless, true);
      assert.equal(JSON.stringify(body).includes("fc-secret"), false);
    },
  );
});

test("speech and updates routes degrade when keys are missing", async () => {
  await withEnv({ SARVAM_API_KEY: undefined, FIRECRAWL_API_KEY: undefined }, async () => {
    const audio = await stt(new Request("http://localhost/api/speech/stt", { method: "POST", body: new FormData() }));
    assert.equal(audio.status, 503);
    const audioBody = await audio.json();
    assert.equal(audioBody.configured, false);

    const search = await updates(
      new Request("http://localhost/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemeIds: ["pm-kisan"] }),
      }),
    );
    assert.equal(search.status, 200);
    const searchBody = await search.json();
    assert.deepEqual(searchBody.updates, []);
    assert.equal(searchBody.configured, false);
    assert.match(searchBody.noteHi, /योजना रिकॉर्ड/);
  });
});
