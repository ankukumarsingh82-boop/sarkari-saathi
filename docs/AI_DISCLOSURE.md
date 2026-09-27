# AI and tool disclosure

AI Build Challenge 2026, project round. This file lists what actually runs in Sarkari Saathi and what was used to build it.

## Models in the running app

| Piece | When it runs | What it does |
| --- | --- | --- |
| None | Default, whenever the matching key is unset or the call fails | Answers are Hindi templates over retrieved scheme text. Speech uses the browser. |
| Gemini, default model `gemini-2.5-flash` | Only if `GEMINI_API_KEY` is set on the server | Rewrites the Hindi prose. The prompt contains only the retrieved scheme records, the rules-engine status, and the user's question. On a few messy Hinglish cues the local extractor misses (spoken ages, "lady", "ITR", "jhuggi", number-words for land), a second short call may fill blank profile fields. A field is kept only when the model quotes a substring of the message that supports it. The rules engine still decides eligibility. |
| OpenAI, default model `gpt-4o-mini` | Only if Gemini is unset and `OPENAI_API_KEY` is set | Same grounded rewrite. It does not fill profile fields. |
| Sarvam speech-to-text, default `saaras:v3` | Only if `SARVAM_API_KEY` is set | `POST https://api.sarvam.ai/speech-to-text` with `language_code=hi-IN`. The browser records a short clip and this server route transcribes it. `saarika:v2.5` remains available via `SARVAM_STT_MODEL` but is the legacy model. |
| Sarvam text-to-speech, default `bulbul:v3` speaker `shubh` | Only if `SARVAM_API_KEY` is set | `POST https://api.sarvam.ai/text-to-speech` in `hi-IN`. Text longer than the model limit (2,500 characters on bulbul v3) is split on sentence boundaries. |
| Firecrawl search | Only if `FIRECRAWL_API_KEY` is set | `POST https://api.firecrawl.dev/v1/search`. After the answer is on screen, up to three result links whose hosts are `*.gov.in` or `*.nic.in` are shown as हाल की आधिकारिक जानकारी. The curated record stays the primary source. |

Eligibility, citations, and the low-confidence flag are computed by the rules engine. If the rewrite omits an official URL, the server appends it. If a low-confidence warning is dropped, the server appends it again. If a call fails or times out (12 seconds for a rewrite, 4 seconds for slot filling and for search), the template answer is what the person sees. Search never blocks that answer.

The key stays on the server (`x-goog-api-key` for Gemini, `api-subscription-key` for Sarvam, `Authorization: Bearer` for Firecrawl). `/api/health` reports only booleans. With no key, speech in and speech out use the browser Web Speech API (`hi-IN` recognition and `speechSynthesis`). Bhashini and Whisper are not called.

## Retrieval

There is no vector database and no embedding API. Retrieval is a weighted keyword match over the Hindi, English, and Hinglish phrases stored with each scheme. The knowledge base is the file `lib/schemes.ts` (15 central schemes). It is not a scrape of an entire portal and it is not a training set.

## Datasets and sources

- The scheme text is an original summary of public pages listed in `docs/PLAN.md`, checked on 27 September 2026. Figures appear only when the cited page stated them.
- `eval/cases.ts` holds 58 hand-written Hindi and Hinglish questions and 6 persona profiles. Labels were written from the same official rules the engine implements. They are not scraped citizen chats.
- No personal beneficiary data, Aadhaar database, or SECC microdata is included. The optional last four Aadhaar digits stay in the browser and are printed only on the local PDF.

## Libraries and runtime tools

- Next.js 15, React 19, TypeScript
- `pdf-lib` and `@pdf-lib/fontkit` embed Noto Sans Devanagari so the draft PDF is one page of selectable text. If that font path fails in the browser, the page falls back to a single canvas image.
- Noto Sans Devanagari, SIL Open Font License, file `public/fonts/NotoSansDevanagari-Regular.ttf`
- Hosting target: Vercel, production branch `main`, public app [https://sarkari-saathi-app.vercel.app](https://sarkari-saathi-app.vercel.app). Set `GEMINI_API_KEY`, `SARVAM_API_KEY`, and `FIRECRAWL_API_KEY` in the project environment when those integrations should run. The app still builds and answers with none of them set.

## Tools used to produce the repository

- Cursor cloud agent, model Grok, wrote and edited this repository on 27 September 2026.
- The demo video and project deck were produced with help from a Grok agent using Playwright screen recording and Microsoft Edge neural TTS voiceover.
- Public web pages of the ministries and PIB, fetched to check eligibility and amounts before they were written into `lib/schemes.ts`.
- No paid dataset, no fine-tune, and no agent framework that submits forms.

## Human approval

The app does not submit an application to any government portal. The PDF download stays disabled until the person checks that they have reviewed the draft. Low-confidence and out-of-scope answers tell the person to verify with the official helpline or office.
