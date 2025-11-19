"use client";

import { useEffect, useMemo, useState } from "react";

type Agent = {
  id: string;
  name: string;
  prompt: string;
  description: string;
  placeholder: string;
};

const AGENTS: Agent[] = [
  {
    id: "mail",
    name: "Email Polish",
    description:
      "Turn whatever you type into a polite, structured, easy-to-read English email.",
    prompt:
      "You are an email assistant who rewrites Chinese or simple English into natural, professional English business emails.",
    placeholder: "Paste or type the email draft you want to send...",
  },
  {
    id: "commit",
    name: "Commit Polish",
    description:
      "Rewrite input as a clear, semantic Git commit message you would ship to prod.",
    prompt:
      "You are a senior engineer who rewrites the input into a one-line summary plus optional bullets suitable for a git commit message.",
    placeholder: "Describe the change, fix, or feature...",
  },
  {
    id: "diary",
    name: "Diary Coach",
    description:
      "Make your English diary sound natural, avoid misunderstandings, and highlight grammar takeaways.",
    prompt:
      "You are an English writing coach who fixes grammar and clarity, rewrites the diary, and explains risky expressions plus grammar to remember.",
    placeholder: "Write what happened today or the sentences you want to practice...",
  },
  {
    id: "standup",
    name: "Stand-up Coach",
    description:
      "Turn your notes into a concise Yesterday / Today / Block stand-up update.",
    prompt:
      "You are a stand-up translator who rewrites the input into simple English under Yesterday, Today, and Blocked sections.",
    placeholder: "What did you finish yesterday? What's next today? Any blockers?",
  },
];

const buildPreview = (agent: Agent, raw: string) => {
  const sentences = raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!sentences.length) {
    return "";
  }

  const transformed = sentences.map((line) => {
    const trimmed = line.replace(/\s+/g, " ");
    if (!trimmed) return "";
    const capitalized =
      trimmed.charAt(0).toUpperCase() + trimmed.slice(1).replace(/\s+/, " ");
    const ending = /[.!?。！？]$/.test(capitalized) ? "" : ".";
    return `${capitalized}${ending}`;
  });

  return transformed.join("\n");
};

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0]);
  const [inputText, setInputText] = useState("");
  const [maskVisible, setMaskVisible] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  useEffect(() => {
    if (!inputText.trim()) {
      return;
    }

    const timer = setTimeout(() => {
      setMaskVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [inputText]);

  const outputText = useMemo(
    () => buildPreview(selectedAgent, inputText),
    [inputText, selectedAgent],
  );

  const handleCopy = async () => {
    if (!outputText.trim()) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row">
        <section className="relative flex w-full flex-col gap-4 rounded-2xl bg-slate-900/80 p-6 shadow-2xl ring-1 ring-slate-800 backdrop-blur">
          <div className="flex flex-wrap gap-2">
            {AGENTS.map((agent) => {
              const isActive = agent.id === selectedAgent.id;
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => {
                    setSelectedAgent(agent);
                    setMaskVisible(false);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-400/90 text-slate-950 shadow"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {agent.name}
                </button>
              );
            })}
          </div>

          <div className="text-sm text-slate-300">
            {selectedAgent.description}
          </div>

          <div className="rounded-xl bg-slate-800/80 p-4 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">Agent Prompt</p>
            <p className="mt-1 leading-relaxed">{selectedAgent.prompt}</p>
          </div>

          <div className="relative flex-1">
            <textarea
              value={inputText}
              onChange={(event) => {
                setInputText(event.target.value);
                setMaskVisible(false);
              }}
              placeholder={selectedAgent.placeholder}
              className={`h-[460px] w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-base text-slate-100 shadow-inner outline-none transition duration-200 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/30 ${maskVisible ? "blur-lg brightness-75" : ""}`}
            />
            {maskVisible && inputText.trim() && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl bg-slate-900/60 backdrop-blur-2xl"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, rgba(15,23,42,0.65) 25%, transparent 25%), linear-gradient(-45deg, rgba(15,23,42,0.65) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(15,23,42,0.65) 75%), linear-gradient(-45deg, transparent 75%, rgba(15,23,42,0.65) 75%)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
                }}
              />
            )}
          </div>
        </section>

        <section className="flex w-full flex-col gap-4 rounded-2xl bg-slate-950/80 p-6 text-white shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/50">
                Result
              </p>
              <h2 className="text-2xl font-semibold text-white">
                {selectedAgent.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!outputText.trim()}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                outputText.trim()
                  ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                  : "cursor-not-allowed bg-slate-800 text-slate-500"
              }`}
            >
              {copyState === "copied"
                ? "Copied"
                : copyState === "error"
                  ? "Copy failed"
                  : "Copy"}
            </button>
          </div>
          <textarea
            readOnly
            value={
              outputText || "Waiting for text on the left to generate a polished result."
            }
            className="h-[460px] w-full resize-none rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-base leading-relaxed text-white/90 shadow-inner outline-none"
          />
        </section>
      </div>
    </div>
  );
}
