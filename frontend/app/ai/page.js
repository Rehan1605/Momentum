"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Loader2, RefreshCw, Send, Sparkles, UserRound } from "lucide-react";

import AppShell from "@/components/AppShell";
import api from "@/services/api";

const prompts = [
  "Why am I inconsistent lately?",
  "How can I improve my study habit?",
  "Why do I skip workouts?",
];

function TextPanel({ title, children, loading, onRefresh }) {
  return (
    <section className="rounded-md border border-white/10 bg-zinc-900/75 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-md p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
          >
            <RefreshCw className="size-4" />
          </button>
        ) : null}
      </div>
      <div className="mt-4 text-sm leading-6 text-zinc-300">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-11/12 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-9/12 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-7/12 animate-pulse rounded bg-zinc-800" />
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export default function AICoachPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Ask me about your habits, mood patterns, streaks, or what to focus on next.",
    },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [insights, setInsights] = useState([]);
  const [motivation, setMotivation] = useState("");
  const [loadingPanels, setLoadingPanels] = useState(true);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  const scrollChat = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollChat();
  }, [messages, chatLoading]);

  const loadPanels = () => {
    setLoadingPanels(true);
    setError("");

    Promise.all([
      api.get("/ai/weekly-summary"),
      api.get("/ai/insights"),
      api.get("/ai/motivate"),
    ])
      .then(([summaryResponse, insightsResponse, motivateResponse]) => {
        setSummary(summaryResponse.data.summary);
        setInsights(insightsResponse.data.insights || []);
        setMotivation(motivateResponse.data.message);
      })
      .catch((requestError) => {
        setError(
          requestError?.response?.data?.message ||
            "Momentum AI could not load. Make sure Ollama is running."
        );
      })
      .finally(() => {
        setLoadingPanels(false);
      });
  };

  useEffect(() => {
    let mounted = true;

    Promise.all([
      api.get("/ai/weekly-summary"),
      api.get("/ai/insights"),
      api.get("/ai/motivate"),
    ])
      .then(([summaryResponse, insightsResponse, motivateResponse]) => {
        if (!mounted) return;
        setSummary(summaryResponse.data.summary);
        setInsights(insightsResponse.data.insights || []);
        setMotivation(motivateResponse.data.message);
      })
      .catch((requestError) => {
        if (!mounted) return;
        setError(
          requestError?.response?.data?.message ||
            "Momentum AI could not load. Make sure Ollama is running."
        );
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingPanels(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const sendMessage = async (text = input) => {
    const message = text.trim();
    if (!message || chatLoading) return;

    setInput("");
    setError("");
    setMessages((current) => [...current, { role: "user", content: message }]);
    setChatLoading(true);

    try {
      const { data } = await api.post("/ai/chat", { message });
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
    } catch (requestError) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            requestError?.response?.data?.message ||
            "I could not reach local Ollama right now. Check that llama3.2 is running.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <AppShell
      title="AI Coach"
      description="Local Ollama coaching that reads your habits, logs, analytics, moods, journals, and badges."
    >
      {error ? (
        <p className="mb-4 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-md border border-white/10 bg-zinc-900/75 p-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <Bot className="size-5 text-emerald-300" />
            <h2 className="text-lg font-semibold text-zinc-100">Coach Chat</h2>
          </div>

          <div className="mt-4 flex h-[520px] flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.map((message, index) => {
                const assistant = message.role === "assistant";

                return (
                  <motion.div
                    key={`${message.role}-${index}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${assistant ? "" : "justify-end"}`}
                  >
                    {assistant ? (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-emerald-400 text-zinc-950">
                        <Bot className="size-4" />
                      </div>
                    ) : null}
                    <div
                      className={`max-w-[82%] rounded-md px-3 py-2 text-sm leading-6 ${
                        assistant
                          ? "bg-white/5 text-zinc-200"
                          : "bg-emerald-400 text-zinc-950"
                      }`}
                    >
                      {message.content}
                    </div>
                    {!assistant ? (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-zinc-300">
                        <UserRound className="size-4" />
                      </div>
                    ) : null}
                  </motion.div>
                );
              })}
              {chatLoading ? (
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Loader2 className="size-4 animate-spin" />
                  Momentum AI is thinking...
                </div>
              ) : null}
              <div ref={chatEndRef} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-md border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="mt-3 flex gap-2"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="h-11 min-w-0 flex-1 rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-emerald-400"
                placeholder="Ask Momentum AI..."
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="flex h-11 items-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-medium text-zinc-950 disabled:opacity-70"
              >
                {chatLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Send
              </button>
            </form>
          </div>
        </section>

        <aside className="space-y-4">
          <TextPanel title="Weekly Summary" loading={loadingPanels} onRefresh={loadPanels}>
            <p>{summary || "No summary available yet."}</p>
          </TextPanel>

          <TextPanel title="Insights" loading={loadingPanels} onRefresh={loadPanels}>
            {insights.length ? (
              <div className="space-y-2">
                {insights.map((insight, index) => (
                  <div key={`${insight}-${index}`} className="rounded-md bg-white/5 p-3">
                    <div className="mb-2 flex items-center gap-2 text-emerald-300">
                      <Sparkles className="size-4" />
                      <span className="text-xs font-medium uppercase">Observation</span>
                    </div>
                    <p>{insight}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No insights available yet.</p>
            )}
          </TextPanel>

          <TextPanel title="Motivation" loading={loadingPanels} onRefresh={loadPanels}>
            <p>{motivation || "No coaching message available yet."}</p>
          </TextPanel>
        </aside>
      </div>
    </AppShell>
  );
}
