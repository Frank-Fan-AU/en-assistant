"use client";

import { useCallback, useEffect, useState } from "react";

import { AGENTS, type Agent } from "@/lib/agents";

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0]);
  const [inputText, setInputText] = useState("");
  const [maskVisible, setMaskVisible] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activityToken, setActivityToken] = useState(0);
  const idleOutputMessage =
    "Waiting for text on the left to generate a polished result.";
  const outputDisplay = isLoading
    ? "Generating response with OpenAI..."
    : outputText || idleOutputMessage;
  const isCopyDisabled = !outputText.trim() || isLoading;

  useEffect(() => {
    if (!inputText.trim()) {
      return;
    }

    const timer = setTimeout(() => {
      setMaskVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [inputText, activityToken]);

  const registerActivity = useCallback(
    (nextValue?: string) => {
      const targetText =
        typeof nextValue === "string" ? nextValue : inputText;

      if (!targetText.trim()) {
        setMaskVisible(false);
        return;
      }

      setMaskVisible(false);
      setActivityToken((token) => token + 1);
    },
    [inputText],
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

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setErrorMessage("Please provide some text to polish.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          input: inputText,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        const message =
          typeof errorPayload?.error === "string"
            ? errorPayload.error
            : "Failed to generate response. Please try again.";
        setErrorMessage(message);
        return;
      }

      const data = (await response.json()) as { result: string };
      setOutputText(data.result.trim());
      setCopyState("idle");
    } catch (error) {
      console.error(error);
      setErrorMessage("Network error. Please check your connection and retry.");
    } finally {
      setIsLoading(false);
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
                    setCopyState("idle");
                    setErrorMessage(null);
                    setActivityToken((token) => token + 1);
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
                registerActivity(event.target.value);
                if (errorMessage) {
                  setErrorMessage(null);
                }
              }}
              onFocus={() => registerActivity()}
              onPointerDown={() => registerActivity()}
              onKeyDown={() => registerActivity()}
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

          <div className="flex flex-col gap-2 pt-2">
            {errorMessage && (
              <p className="text-sm text-rose-300">{errorMessage}</p>
            )}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className={`rounded-2xl px-6 py-3 text-base font-semibold text-slate-950 transition ${
                isLoading
                  ? "cursor-not-allowed bg-slate-700 text-slate-400"
                  : "bg-emerald-400 hover:bg-emerald-300"
              }`}
            >
              {isLoading ? "Generating..." : `Run ${selectedAgent.name}`}
            </button>
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
              disabled={isCopyDisabled}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                !isCopyDisabled
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
            value={outputDisplay}
            className="h-[460px] w-full resize-none rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-base leading-relaxed text-white/90 shadow-inner outline-none"
          />
        </section>
      </div>
    </div>
  );
}
