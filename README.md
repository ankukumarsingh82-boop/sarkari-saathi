# सरकारी साथी · Sarkari Saathi

A Hindi-first voice and text assistant that explains Indian government schemes in plain Hindi. Built for the AI Build Challenge 2026, track PS-06 (AI for Bharat in Indian Languages).

A small farmer, a daily-wage worker, or an older person who is comfortable in Hindi can ask which scheme fits, hear the answer, see the papers to carry, and leave with a form draft they have checked themselves. The app does not file anything.

## Features

1. **Hindi voice in and out.** Type, or use the mic. When `SARVAM_API_KEY` is set, the mic records a short clip and the server transcribes it with Sarvam (`saaras:v3`, `hi-IN`); readout plays Sarvam Bulbul audio. Otherwise speech recognition and readout use the browser Web Speech API in `hi-IN`. Hinglish works on the text path (`mujhe kisaan ke liye kaunsi yojana milegi?`).
2. **Scheme finder.** Age, state, occupation, income, land, category, and gender, plus a few yes/no facts, go through a rules engine.
3. **Cited answers.** Every scheme card and every scheme named in the answer carries the official URL and the date that page was checked (27 September 2026).
4. **Document checklist.** Papers for each matched scheme, from the same record as the answer.
5. **Guided form draft.** A PDF is built in the browser. The download stays off until the person confirms they have reviewed it. The file says it is a draft and that it was not submitted.

Fifteen central schemes are in the knowledge base: PM-KISAN, Ayushman Bharat PM-JAY, PMAY-G, PM Ujjwala, Sukanya Samriddhi, Atal Pension Yojana, PMJJBY, PMSBY, PM Mudra, PM Vishwakarma, National Scholarship Portal, e-Shram, PM SVANidhi, Janani Suraksha Yojana, and the NSAP old-age pension (IGNOAPS).

## What works with no key, and what a key adds

| | No key | Key set |
| --- | --- | --- |
| Eligibility | Rules engine | Same rules engine. Gemini may only fill profile fields the local extractor left blank, and only from a quote in the message. The model does not set the status. |
| Wording | Fixed simple Hindi | Gemini (`gemini-2.5-flash`) or, if that key is empty, OpenAI rewrites the prose from the retrieved records. |
| Citations | Always, from the record | Appended again if the model drops a URL. |
| Voice | Browser `hi-IN` | `SARVAM_API_KEY`: Sarvam speech-to-text and text-to-speech. Browser voice if the call fails. |
| Official updates | Not fetched | `FIRECRAWL_API_KEY`: after the answer renders, up to three `*.gov.in` / `*.nic.in` links labelled हाल की आधिकारिक जानकारी. The curated record stays the primary source. |
| PDF | Browser, after confirmation | Same. |

If a request fails or times out, the Hindi template (and the browser voice) is what the person gets. `/api/health` reports `gemini`, `sarvam`, and `search` as booleans and never returns a key.

## Architecture

```mermaid
flowchart TD
  user[Hindi or Hinglish voice or text] --> voice{Sarvam key?}
  voice -->|yes| sarvam[Sarvam STT]
  voice -->|no or failure| browser[Browser hi-IN speech]
  sarvam --> extract[Slot extractor]
  browser --> extract
  extract --> gaps{Messy cue and Gemini key?}
  gaps -->|yes| fill[Fill blank fields from a quote in the message]
  gaps -->|no| profile[Profile]
  fill --> profile
  profile --> rules[Rules engine]
  user --> retrieve[Keyword retrieval over 15 scheme records]
  retrieve --> rules
  rules --> template[Hindi template with official URL]
  template --> gate{Gemini or OpenAI key?}
  gate -->|no or failure| ui[Cards, checklist, confirm, PDF]
  gate -->|yes| llm[Rewrite wording only, keep URLs]
  llm --> ui
  ui --> search{Firecrawl key?}
  search -->|yes| links[Up to 3 gov.in or nic.in links]
  search -->|no| done[Answer stands alone]
  links --> done
```

Details, sources, and the plan through 1 October are in [docs/PLAN.md](docs/PLAN.md). Models, APIs, and datasets are listed in [docs/AI_DISCLOSURE.md](docs/AI_DISCLOSURE.md).

## Local setup

Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local   # leave the keys empty
npm run dev
```

Open http://localhost:3000.

```bash
npm test          # unit tests, including mocked Gemini, Sarvam, and Firecrawl
npm run eval      # 58 Hindi and Hinglish queries, keyless
npm run eval -- --llm   # same metrics through the rewrite path; needs a key
npm run build && npm start
```

### Environment

See `.env.example`. Set these on Vercel (and in `.env.local` for a keyed local run). Leave them empty for the keyless demo.

| Name | Role |
| --- | --- |
| `GEMINI_API_KEY` | Hindi rewrite, and gap-fill for a few messy Hinglish cues. Header `x-goog-api-key`. |
| `GEMINI_MODEL` | Default `gemini-2.5-flash`. |
| `OPENAI_API_KEY` | Rewrite only, and only when Gemini is unset. |
| `OPENAI_MODEL` | Default `gpt-4o-mini`. |
| `SARVAM_API_KEY` | Hindi STT and TTS. Header `api-subscription-key`. |
| `SARVAM_STT_MODEL` | Default `saaras:v3` (`mode=transcribe`, `hi-IN`). |
| `SARVAM_TTS_MODEL` | Default `bulbul:v3`. |
| `SARVAM_TTS_SPEAKER` | Default `shubh`. |
| `FIRECRAWL_API_KEY` | Official-domain search. Bearer token. |

No database. Vercel can import this repository with zero extra config: it is a Next.js App Router project. Keys are read at request time.

## Evaluation

`eval/cases.ts` has **58** questions (**34** Hindi, **24** Hinglish) and **6** persona profiles. A case passes when every expected scheme is `eligible` or `likely`, and every forbidden scheme is not. Citation passes when the official URL of each expected scheme is in the answer (or any official URL, when the correct outcome is a confident rejection). Low-confidence agreement checks the flag on out-of-scope questions, list-based `likely` matches, and confident eligibility decisions.

`npm run eval -- --llm` (or `npm run eval:llm`) loads `.env.local` without overriding variables already in the shell, then runs the same 58 questions through `maybeRewrite`. Eligibility still comes from the rules engine. The report is written to `eval/results-llm.json` and is not part of the keyless baseline. Slot filling is not part of this score: it only runs on `/api/chat`, and only for cues the local extractor misses.

Latest keyless run (`npm run eval`, 27 September 2026), also stored in `eval/results.json`:

| Metric | Result |
| --- | --- |
| Eligibility accuracy | **100%** (58/58) |
| Citation presence | **100%** (53/53 cases that require a source) |
| Low-confidence agreement | **100%** (58/58) |
| Unit tests | 30 passing |

This is a deterministic check against labels written from the same official rules as the engine, including negatives (income-tax payer, wrong age, man asking for Ujjwala, pucca house, out-of-scope cricket and weather). It is not a blind field study. Hindi fluency still needs a human rating of 1–5 before submission. The deck's target was at least 90% eligibility accuracy and a cited answer.

## Demo script (about 3 minutes)

1. **0:00** Open the deployed link on a phone. Point at the banner: nothing is submitted, and a weak answer says to check the office.
2. **0:20** Tap the mic, or type: `mujhe kisaan ke liye kaunsi yojana milegi? main UP ka kisaan hoon, umar 42, 2 acre, bank account hai`. Show PM-KISAN in Hindi, ₹6,000, and the pmkisan.gov.in link. Tap “ज़ोर से सुनें”. With `SARVAM_API_KEY`, the mic records and Sarvam speaks the answer; without it, the browser `hi-IN` voices do both.
3. **1:05** Open पात्रता. Fill a 68-year-old BPL person in Bihar and press योजनाएँ देखें. Show the old-age pension and the note that the state adds its own top-up.
4. **1:40** Ask `aaj cricket ka score kya hai`. Show the low-confidence line and that no scheme is recommended.
5. **2:00** Open दस्तावेज़ on the farmer result, then ड्राफ्ट. Leave the confirm box empty and show that download stays disabled. Check the box, download the PDF, and show the “not submitted” line.
6. **2:40** Tap one official link so the source opens. Close on the badge “बिना कुंजी · स्थानीय”.

## Status against 1 October

In this repository now: Hindi MVP that runs with or without keys, 15 sourced schemes, Sarvam voice with a browser fallback, optional official-link search, checklist, confirmed PDF, tests, eval, and a Vercel-ready Next.js app.

Still to do before the deadline: record the 3-minute video, export the 10-slide project deck, and re-score the 58 answers with `npm run eval -- --llm` plus a human Hindi rating once the Gemini key is in the environment. State schemes are an upgrade, not required for the demo.
