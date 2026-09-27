"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";

const FormDraft = dynamic(() => import("@/components/FormDraft").then((mod) => mod.FormDraft), { ssr: false });
import { INDIAN_STATES } from "@/lib/extract";
import { schemes } from "@/lib/schemes";
import type { Answer, Profile } from "@/lib/types";

type Tab = "chat" | "form" | "schemes" | "draft";

interface UpdateLink {
  title: string;
  url: string;
}

interface Turn {
  role: "user" | "bot";
  id?: string;
  text: string;
  answer?: Answer;
  updates?: UpdateLink[];
}

const EMPTY: Profile = {};

const SUGGESTIONS = [
  "मुझे किसान के लिए कौन सी योजना मिलेगी?",
  "बुढ़ापे की पेंशन कैसे मिलती है?",
  "बेटी के लिए सुकन्या समृद्धि",
  "गैस कनेक्शन चाहिए",
];

export function SaathiApp() {
  const [tab, setTab] = useState<Tab>("chat");
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [draftScheme, setDraftScheme] = useState("pm-kisan");
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("local");
  const [sarvam, setSarvam] = useState(false);
  const [searchOn, setSearchOn] = useState(false);
  const [english, setEnglish] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recordTimer = useRef<number | null>(null);
  const playback = useRef(0);
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "bot",
      text: "नमस्ते। मैं सरकारी साथी हूँ। हिन्दी या हिंग्लिश में योजना पूछें, या माइक दबाएँ। मैं स्रोत के साथ जवाब दूँगा। आवेदन मैं जमा नहीं करता।",
    },
  ]);

  useEffect(() => {
    const saved = window.localStorage.getItem("saathi-profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved) as Profile);
      } catch {
        /* keep empty */
      }
    }
    fetch("/api/health")
      .then((response) => response.json())
      .then((data: { mode?: string; sarvam?: boolean; search?: boolean }) => {
        setMode(data.mode ?? "local");
        setSarvam(Boolean(data.sarvam));
        setSearchOn(Boolean(data.search));
      })
      .catch(() => setMode("local"));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("saathi-profile", JSON.stringify(profile));
  }, [profile]);

  const latest = useMemo(() => [...turns].reverse().find((turn) => turn.answer)?.answer, [turns]);

  async function ask(message: string) {
    const clean = message.trim();
    if (!clean || busy) return;
    setText("");
    setTurns((current) => [...current, { role: "user", text: clean }]);
    setBusy(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, profile }),
      });
      const answer = (await response.json()) as Answer;
      setProfile(answer.profile);
      if (answer.schemes[0]) setDraftScheme(answer.schemes[0].schemeId);
      setMode(answer.mode);
      const id = crypto.randomUUID();
      setTurns((current) => [
        ...current,
        { role: "bot", id, text: english ? answer.answerEn : answer.answerHi, answer },
      ]);
      if (searchOn && answer.schemes.length) {
        const schemeIds = answer.schemes.slice(0, 3).map((match) => match.schemeId);
        void fetch("/api/updates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schemeIds }),
        })
          .then((updateResponse) => (updateResponse.ok ? updateResponse.json() : null))
          .then((data: { updates?: UpdateLink[] } | null) => {
            const updates = (data?.updates ?? []).filter((item) => item.url.startsWith("http")).slice(0, 3);
            if (!updates.length) return;
            setTurns((current) => current.map((turn) => (turn.id === id ? { ...turn, updates } : turn)));
          })
          .catch(() => undefined);
      }
    } catch {
      setTurns((current) => [
        ...current,
        {
          role: "bot",
          text: "अभी जवाब नहीं बन पाया। फिर कोशिश करें। यह जवाब पक्का नहीं है। कृपया आधिकारिक हेल्पलाइन या नज़दीकी सरकारी कार्यालय पर जाँच करें।",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function speakBrowser(line: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(line);
    utterance.lang = "hi-IN";
    window.speechSynthesis.speak(utterance);
  }

  function stopPlayback() {
    playback.current += 1;
    window.speechSynthesis?.cancel();
  }

  async function playSequence(audios: string[], token: number) {
    for (const b64 of audios) {
      if (token !== playback.current) return;
      const bytes = Uint8Array.from(atob(b64), (char) => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
      try {
        await new Promise<void>((resolve, reject) => {
          const audio = new Audio(url);
          audio.onended = () => resolve();
          audio.onerror = () => reject(new Error("audio"));
          void audio.play().catch(reject);
        });
      } finally {
        URL.revokeObjectURL(url);
      }
    }
  }

  async function speak(line: string) {
    stopPlayback();
    const token = playback.current;
    if (sarvam) {
      try {
        const response = await fetch("/api/speech/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: line.slice(0, 8000) }),
        });
        if (response.ok) {
          const data = (await response.json()) as { audios?: string[] };
          if (data.audios?.length) {
            await playSequence(data.audios, token);
            return;
          }
        }
      } catch {
        /* browser voice below */
      }
    }
    if (token !== playback.current) return;
    speakBrowser(line);
  }

  function listenBrowser() {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      setTurns((current) => [
        ...current,
        { role: "bot", text: "इस ब्राउज़र में हिन्दी आवाज़ पहचान नहीं है। Chrome में खोलें, या टाइप करें।" },
      ]);
      return;
    }
    const recognition = new Ctor();
    recognitionRef.current = recognition;
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    setListening(true);
    recognition.onresult = (event) => {
      const said = event.results[0]?.[0]?.transcript ?? "";
      setListening(false);
      if (said) void ask(said);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  async function listenSarvam() {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      listenBrowser();
      return;
    }
    const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
    let recorder: MediaRecorder;
    try {
      recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      listenBrowser();
      return;
    }
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      if (recordTimer.current) window.clearTimeout(recordTimer.current);
      setListening(false);
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      if (blob.size < 800) {
        setTurns((current) => [
          ...current,
          { role: "bot", text: "आवाज़ बहुत छोटी थी। फिर बोलें, या सवाल टाइप करें।" },
        ]);
        return;
      }
      void sendAudio(blob, recorder.mimeType || "audio/webm");
    };
    recorderRef.current = recorder;
    setListening(true);
    recorder.start();
    recordTimer.current = window.setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, 28000);
  }

  async function sendAudio(blob: Blob, mime: string) {
    const extension = mime.includes("mp4") ? "m4a" : "webm";
    const form = new FormData();
    form.append("file", blob, `speech.${extension}`);
    try {
      const response = await fetch("/api/speech/stt", { method: "POST", body: form });
      const data = (await response.json()) as { transcript?: string | null };
      if (response.ok && data.transcript) {
        void ask(data.transcript);
        return;
      }
    } catch {
      /* message below */
    }
    setTurns((current) => [
      ...current,
      { role: "bot", text: "आवाज़ समझ नहीं आई। फिर बोलें, या सवाल टाइप करें।" },
    ]);
  }

  function listen() {
    if (listening) {
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    if (sarvam && typeof window.MediaRecorder !== "undefined" && navigator.mediaDevices) {
      void listenSarvam();
      return;
    }
    listenBrowser();
  }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <h1>सरकारी साथी</h1>
          <p>योजनाएँ, आसान हिन्दी में। आवाज़ या लिखकर पूछें।</p>
        </div>
        <div className="badge">{mode === "local" ? "बिना कुंजी · स्थानीय" : mode}</div>
      </header>
      <div className="banner">
        अंतिम पात्रता सरकारी रिकॉर्ड से तय होती है। कम भरोसे के जवाब पर कार्यालय या हेल्पलाइन से जाँच करें। फ़ॉर्म ड्राफ्ट आपकी पुष्टि के बाद ही डाउनलोड होता है।
      </div>
      <div className="row" style={{ marginBottom: 12 }}>
        <button className="chip" onClick={() => setEnglish((value) => !value)}>
          {english ? "हिन्दी में पढ़ें" : "English में पढ़ें"}
        </button>
      </div>
      <nav className="nav">
        {([
          ["chat", "बात"],
          ["form", "पात्रता"],
          ["schemes", "योजना"],
          ["draft", "ड्राफ्ट"],
        ] as [Tab, string][]).map(([id, label]) => (
          <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>
      <div className="layout">
        <section className={`panel chat ${tab === "chat" ? "" : "hide-on-mobile"}`}>
          <div className="thread">
            {turns.map((turn, index) => (
              <article key={index} className={`bubble ${turn.role} ${turn.answer?.lowConfidence ? "low" : ""}`}>
                {turn.text}
                {turn.role === "bot" && (
                  <div>
                    <button className="speak" onClick={() => speak(turn.text)}>
                      ज़ोर से सुनें
                    </button>
                  </div>
                )}
                {turn.answer && <SchemeCards answer={turn.answer} english={english} onDraft={(id) => { setDraftScheme(id); setTab("draft"); }} />}
                {turn.updates && turn.updates.length > 0 && (
                  <div className="updates">
                    <h4>हाल की आधिकारिक जानकारी</h4>
                    <p className="small">
                      {english
                        ? "The curated scheme record above is the primary source. These are extra official links."
                        : "मुख्य स्रोत ऊपर दिया गया योजना रिकॉर्ड है। ये लिंक अतिरिक्त आधिकारिक पन्ने हैं।"}
                    </p>
                    <ul>
                      {turn.updates.map((item) => (
                        <li key={item.url}>
                          <a href={item.url} target="_blank" rel="noreferrer">
                            {item.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
          <div className="chips">
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} className="chip" onClick={() => void ask(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
          <div className="composer">
            <button className={`icon-btn ${listening ? "live" : ""}`} onClick={listen} aria-label="माइक">
              {listening ? "…" : "🎤"}
            </button>
            <textarea
              value={text}
              placeholder="हिन्दी या हिंग्लिश में पूछें"
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void ask(text);
                }
              }}
            />
            <button className="send" disabled={busy || !text.trim()} onClick={() => void ask(text)}>
              भेजें
            </button>
          </div>
        </section>
        <div className={`stack ${tab === "chat" ? "desktop-only" : ""}`}>
          {(tab === "chat" || tab === "form") && (
            <EligibilityForm
              profile={profile}
              onChange={setProfile}
              onSubmit={() => {
                setTab("chat");
                void ask("मुझे कौन सी योजना मिल सकती है?");
              }}
            />
          )}
          {tab === "schemes" && (
            <Browse english={english} onPick={(id) => { setDraftScheme(id); setTab("draft"); }} />
          )}
          {tab === "draft" && (
            <FormDraft profile={profile} schemeId={draftScheme} onSchemeId={setDraftScheme} />
          )}
          {latest && tab !== "draft" && tab !== "schemes" && <Checklist answer={latest} english={english} />}
        </div>
      </div>
    </div>
  );
}

function SchemeCards({
  answer,
  english,
  onDraft,
}: {
  answer: Answer;
  english: boolean;
  onDraft: (id: string) => void;
}) {
  if (!answer.schemes.length) return null;
  return (
    <div className="cards">
      {answer.schemes.map((match) => {
        const scheme = schemes.find((item) => item.id === match.schemeId);
        if (!scheme) return null;
        return (
          <div className="card" key={match.schemeId}>
            <span className={`pill ${match.status}`}>{match.status}</span>
            <h3>{english ? scheme.nameEn : scheme.nameHi}</h3>
            <p>{english ? scheme.summaryEn : scheme.summaryHi}</p>
            <p className="meta">
              स्रोत जाँचा {scheme.sourceCheckedOn}:{" "}
              <a href={scheme.officialUrl} target="_blank" rel="noreferrer">
                {scheme.officialUrl}
              </a>
            </p>
            <button className="chip" onClick={() => onDraft(match.schemeId)}>
              ड्राफ्ट बनाएँ
            </button>
          </div>
        );
      })}
    </div>
  );
}

function Checklist({ answer, english }: { answer: Answer; english: boolean }) {
  const rows = answer.schemes.filter((match) => match.status === "eligible" || match.status === "likely");
  if (!rows.length) return null;
  return (
    <section className="panel draft">
      <h2>दस्तावेज़</h2>
      {rows.map((match) => {
        const scheme = schemes.find((item) => item.id === match.schemeId);
        if (!scheme) return null;
        const items = english ? scheme.documentsEn : scheme.documentsHi;
        return (
          <div key={match.schemeId}>
            <strong>{english ? scheme.nameEn : scheme.nameHi}</strong>
            <ul className="docs">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

function EligibilityForm({
  profile,
  onChange,
  onSubmit,
}: {
  profile: Profile;
  onChange: (profile: Profile) => void;
  onSubmit: () => void;
}) {
  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    onChange({ ...profile, [key]: value });
  }
  return (
    <section className="panel form">
      <h2>पात्रता फ़ॉर्म</h2>
      <div className="grid">
        <label>
          उम्र
          <input
            inputMode="numeric"
            value={profile.age ?? ""}
            onChange={(event) => set("age", event.target.value ? Number(event.target.value) : undefined)}
          />
        </label>
        <label>
          राज्य
          <select value={profile.state ?? ""} onChange={(event) => set("state", event.target.value || undefined)}>
            <option value="">चुनें</option>
            {INDIAN_STATES.map((state) => (
              <option key={state}>{state}</option>
            ))}
          </select>
        </label>
        <label>
          काम
          <select
            value={profile.occupation ?? ""}
            onChange={(event) => {
              const occupation = (event.target.value || undefined) as Profile["occupation"];
              onChange({
                ...profile,
                occupation,
                isArtisan: occupation === "artisan" ? true : profile.isArtisan,
                isStreetVendor: occupation === "street_vendor" ? true : profile.isStreetVendor,
              });
            }}
          >
            <option value="">चुनें</option>
            <option value="farmer">किसान</option>
            <option value="daily_wage">मज़दूर</option>
            <option value="student">छात्र</option>
            <option value="self_employed">छोटा कारोबार</option>
            <option value="salaried">नौकरी</option>
            <option value="homemaker">घर का काम</option>
            <option value="artisan">कारीगर</option>
            <option value="street_vendor">रेहड़ी / ठेला</option>
            <option value="unemployed">अभी काम नहीं</option>
            <option value="other">अन्य</option>
          </select>
        </label>
        <label>
          सालाना आय (रुपये)
          <input
            inputMode="numeric"
            value={profile.annualIncome ?? ""}
            onChange={(event) => set("annualIncome", event.target.value ? Number(event.target.value) : undefined)}
          />
        </label>
        <label>
          ज़मीन (एकड़)
          <input
            inputMode="decimal"
            value={profile.landAcres ?? ""}
            onChange={(event) => set("landAcres", event.target.value ? Number(event.target.value) : undefined)}
          />
        </label>
        <label>
          वर्ग
          <select value={profile.category ?? ""} onChange={(event) => set("category", (event.target.value || undefined) as Profile["category"])}>
            <option value="">चुनें</option>
            <option value="general">सामान्य</option>
            <option value="obc">ओबीसी</option>
            <option value="sc">अनुसूचित जाति</option>
            <option value="st">अनुसूचित जनजाति</option>
            <option value="ews">ईडब्ल्यूएस</option>
          </select>
        </label>
        <label>
          लिंग
          <select value={profile.gender ?? ""} onChange={(event) => set("gender", (event.target.value || undefined) as Profile["gender"])}>
            <option value="">चुनें</option>
            <option value="female">महिला</option>
            <option value="male">पुरुष</option>
            <option value="other">अन्य</option>
          </select>
        </label>
        <label>
          गाँव या शहर
          <select value={profile.area ?? ""} onChange={(event) => set("area", (event.target.value || undefined) as Profile["area"])}>
            <option value="">चुनें</option>
            <option value="rural">गाँव</option>
            <option value="urban">शहर</option>
          </select>
        </label>
      </div>
      <Bool label="बैंक खाता है" value={profile.hasBankAccount} onChange={(value) => set("hasBankAccount", value)} />
      <Bool label="बीपीएल परिवार" value={profile.isBpl} onChange={(value) => set("isBpl", value)} />
      <Bool label="पिछले साल इनकम टैक्स भरा" value={profile.paysIncomeTax} onChange={(value) => set("paysIncomeTax", value)} />
      <Bool label="पक्का मकान है" value={profile.hasPuccaHouse} onChange={(value) => set("hasPuccaHouse", value)} />
      <Bool label="10 साल से छोटी बेटी है" value={profile.hasGirlChildUnder10} onChange={(value) => set("hasGirlChildUnder10", value)} />
      <Bool label="गर्भवती हूँ" value={profile.isPregnant} onChange={(value) => set("isPregnant", value)} />
      <button className="primary" onClick={onSubmit}>
        योजनाएँ देखें
      </button>
    </section>
  );
}

function Bool({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
}) {
  return (
    <label>
      {label}
      <select
        value={value === undefined ? "" : value ? "yes" : "no"}
        onChange={(event) => onChange(event.target.value === "" ? undefined : event.target.value === "yes")}
      >
        <option value="">पता नहीं</option>
        <option value="yes">हाँ</option>
        <option value="no">नहीं</option>
      </select>
    </label>
  );
}

function Browse({ english, onPick }: { english: boolean; onPick: (id: string) => void }) {
  return (
    <section className="panel browse">
      <h2>पंद्रह केन्द्रीय योजनाएँ</h2>
      <p className="small">सार हमारे शब्दों में हैं। आँकड़े 27 सितम्बर 2026 को लिखे स्रोत से जाँचे गए।</p>
      {schemes.map((scheme) => (
        <article className="card" key={scheme.id}>
          <h3>{english ? scheme.nameEn : scheme.nameHi}</h3>
          <p>{english ? scheme.summaryEn : scheme.summaryHi}</p>
          <p className="meta">
            <a href={scheme.officialUrl} target="_blank" rel="noreferrer">
              {scheme.officialUrl}
            </a>
          </p>
          <button className="chip" onClick={() => onPick(scheme.id)}>
            ड्राफ्ट
          </button>
        </article>
      ))}
    </section>
  );
}
