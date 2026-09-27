# AI and tool disclosure

AI Build Challenge 2026, project round. This file lists what actually runs in Sarkari Saathi and what was used to build it.

## Models in the running app

| Piece | When it runs | What it does |
| --- | --- | --- |
| None | Default, including the public demo | No model is called. Answers are Hindi templates over retrieved scheme text. |
| Gemini, default model `gemini-2.0-flash` | Only if `GEMINI_API_KEY` is set on the server | Rewrites the Hindi prose. The prompt contains only the retrieved scheme records, the rules-engine status, and the user's question. |
| OpenAI, default model `gpt-4o-mini` | Only if Gemini is unset and `OPENAI_API_KEY` is set | Same grounded rewrite. |

Eligibility, citations, and the low-confidence flag are computed before any model call. If the model omits an official URL, the server appends it. If the call fails or times out (12 seconds), the template answer is returned unchanged.

The idea deck mentioned Sarvam AI, Bhashini, and Whisper. This build does not call them. Speech in and speech out use the browser Web Speech API (`hi-IN` recognition and `speechSynthesis`). That keeps the deployed link usable with no key.

## Retrieval

There is no vector database and no embedding API. Retrieval is a weighted keyword match over the Hindi, English, and Hinglish phrases stored with each scheme. The knowledge base is the file `lib/schemes.ts` (15 central schemes). It is not a scrape of an entire portal and it is not a training set.

## Datasets and sources

- The scheme text is an original summary of public pages listed in `docs/PLAN.md`, checked on 27 September 2026. Figures appear only when the cited page stated them.
- `eval/cases.ts` holds 58 hand-written Hindi and Hinglish questions and 6 persona profiles. Labels were written from the same official rules the engine implements. They are not scraped citizen chats.
- No personal beneficiary data, Aadhaar database, or SECC microdata is included. The optional last four Aadhaar digits stay in the browser and are printed only on the local PDF.

## Libraries and runtime tools

- Next.js 15, React 19, TypeScript
- `pdf-lib` to wrap a browser-canvas rendering of the draft (so Devanagari shaping is done by the browser, not guessed)
- Noto Sans Devanagari, SIL Open Font License, file `public/fonts/NotoSansDevanagari-Regular.ttf`
- Hosting target: Vercel, zero-config import of this Next.js app

## Tools used to produce the repository

- Cursor cloud agent, model Grok, wrote and edited this repository on 27 September 2026.
- Public web pages of the ministries and PIB, fetched to check eligibility and amounts before they were written into `lib/schemes.ts`.
- No paid dataset, no fine-tune, and no agent framework that submits forms.

## Human approval

The app does not submit an application to any government portal. The PDF download stays disabled until the person checks that they have reviewed the draft. Low-confidence and out-of-scope answers tell the person to verify with the official helpline or office.
