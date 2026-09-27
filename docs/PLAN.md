# Sarkari Saathi — build plan

Track: PS-06, AI for Bharat in Indian Languages.
Deadline: 1 October 2026, 11:59 PM IST.
Idea deck: Hindi voice-and-text assistant that explains central schemes, checks eligibility, cites the official page, lists documents, and prepares a form draft the person must confirm.

## Architecture

The public link has to work with no API key. The core is therefore deterministic.

```text
Hindi or Hinglish text
  (typed, Sarvam STT when SARVAM_API_KEY is set, otherwise Web Speech hi-IN)
        |
        v
slot extractor  --->  profile
        |
        +--> if GEMINI_API_KEY and the text has a cue the extractor missed:
               fill only the blank fields, and only when the quote is in the message
        |
        v
keyword retrieval over 15 scheme records
        |
        v
rules engine (eligible / likely / ineligible / unknown)
        |
        +--> Hindi template answer + official URL
        |
        +--> if GEMINI_API_KEY or OPENAI_API_KEY:
               rewrite the prose only, grounded in the same records
               eligibility status is not taken from the model
        |
        +--> after the answer renders, if FIRECRAWL_API_KEY:
               up to 3 official *.gov.in / *.nic.in links, cached briefly
        |
        v
scheme cards, document checklist, confirmed PDF draft
readout: Sarvam TTS when configured, otherwise browser speechSynthesis
```

Eligibility never depends on the model. A missing fact stays `unknown` instead of being guessed. `likely` means the official list (SECC, Awaas+, Gram Sabha, deprivation declaration, bank sanction) still has to confirm the name. The screen always says the government record is final. A low-confidence or out-of-scope answer adds an explicit line: verify with the helpline or the nearest office. The PDF is generated in the browser and is not uploaded.

## Milestones

| When | What |
| --- | --- |
| 27 Sep | Working keyless MVP: 15 schemes, rules, Hindi UI, voice buttons, checklist, confirmed PDF, 58-query eval, deploy. This run. |
| 28 Sep | Read the answers aloud with a second person and fix stiff Hindi. Add two or three state schemes only where a ministry page can be cited the same day. |
| 29 Sep | If a Gemini or OpenAI key is available, run the same 58 queries through the model path and record any citation the model drops. Keep the template as fallback. |
| 30 Sep | 3-minute demo video and the 10-slide project deck. Time one farmer persona from question to confirmed PDF. |
| 1 Oct | Freeze the repo. Submit the link, repo, video, deck, and this disclosure. No rule changes after the eval is re-run. |

## Data sources

Only public government pages. Each scheme record stores `officialUrl`, `sourceUrl`, and `sourceCheckedOn` (2026-09-27). Amounts are copied only when that page stated them. Where the live page does not fix a single rupee figure (Janani Suraksha packages, scholarship amounts, Atal Pension contribution tables, the state top-up on NSAP), the record says so and does not invent a number.

Primary pages:

- PM-KISAN — https://www.pmkisan.gov.in/
- Ayushman Bharat PM-JAY — https://nha.gov.in/PM-JAY and PIB note of 28 Jul 2026 on the age-70 expansion
- PMAY-G — https://pmayg.dord.gov.in/ and PIB https://www.pib.gov.in/PressReleasePage.aspx?PRID=2148468
- PM Ujjwala — https://www.pmuy.gov.in/ujjwala2.html
- Sukanya Samriddhi — India Post gazette PDF of the 2019 scheme rules
- APY and PMJJBY — PDFs on https://jansuraksha.gov.in/
- PMSBY and PM Mudra — https://financialservices.gov.in/
- PM Vishwakarma — scheme guidelines PDF (MoMSME text)
- National Scholarship Portal — https://scholarships.gov.in/
- e-Shram — https://eshram.gov.in/faqs
- PM SVANidhi — MoHUA scheme guidelines
- Janani Suraksha — NHM scheme page
- IGNOAPS / NSAP — https://nsap.nic.in/ and the PIB NSAP note of Nov 2025

## Risks

- Scheme amounts and exclusion lists change. The checked date is on every card so a stale figure is visible. A number that was not on the cited page is omitted.
- PM-JAY, PMAY-G and Ujjwala are list-based. The engine marks them `likely` or `unknown`, not a guaranteed `eligible`, except the published age-70 PM-JAY rule.
- Browser speech recognition needs Chrome (or another browser with `hi-IN` Web Speech). The text path does not.
- Keyword retrieval misses paraphrases that share no scheme word. Those fall through to the profile questions or the low-confidence line. An embedding index is a later upgrade, not a dependency of the demo.
- The labeled eval measures agreement with this rule set, including deliberate negatives. It is not a field audit of unseen questions. Hindi fluency still needs a human score before 1 Oct.
- The temporary Vercel URL expires. The GitHub import path is the durable deploy.
