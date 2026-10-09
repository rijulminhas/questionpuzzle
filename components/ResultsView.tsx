"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ResultsDTO } from "@/types/question";

interface ResultsViewProps {
  resultsToken: string;
}

type FetchState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "not_found" }
  | { status: "ready"; data: ResultsDTO };

const POLL_INTERVAL_MS = 4000;

export default function ResultsView({ resultsToken }: ResultsViewProps) {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchResults() {
      try {
        const res = await fetch(`/api/results/${resultsToken}`, { cache: "no-store" });
        if (cancelled) return;
        if (res.status === 404) {
          setState({ status: "not_found" });
          return;
        }
        if (!res.ok) {
          setState((prev) => (prev.status === "ready" ? prev : { status: "error" }));
          return;
        }
        const data: ResultsDTO = await res.json();
        if (cancelled) return;
        setState({ status: "ready", data });
        if (data.status === "ANSWERED" && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch {
        if (!cancelled) {
          setState((prev) => (prev.status === "ready" ? prev : { status: "error" }));
        }
      }
    }

    fetchResults();
    pollRef.current = setInterval(fetchResults, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [resultsToken]);

  if (state.status === "loading") {
    return (
      <div
        className="rounded-3xl border border-white/60 bg-white/90 p-8 text-center shadow-xl shadow-purple-200/50 backdrop-blur"
        role="status"
      >
        <p className="text-slate-500">Loading results…</p>
      </div>
    );
  }

  if (state.status === "not_found") {
    return (
      <div className="rounded-3xl border border-white/60 bg-white/90 p-8 text-center shadow-xl shadow-purple-200/50 backdrop-blur">
        <p className="font-medium text-slate-600" role="alert">
          This results link is invalid. Double-check the link you were given.
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-3xl border border-white/60 bg-white/90 p-8 text-center shadow-xl shadow-purple-200/50 backdrop-blur">
        <p className="font-medium text-slate-600" role="alert">
          Couldn&apos;t load results right now. Retrying automatically…
        </p>
      </div>
    );
  }

  const { data } = state;
  const answerUrl =
    typeof window !== "undefined" ? `${window.location.origin}/answer/${data.questionId}` : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard may be unavailable — the link is shown on screen either way.
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-white/60 bg-white/90 p-8 shadow-xl shadow-purple-200/50 backdrop-blur">
      <div className="space-y-1 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-purple-500">
          Your Results
        </p>
        <h1 className="text-2xl font-bold text-slate-800">{data.questionText}</h1>
      </div>

      {data.status === "PENDING" ? (
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <OptionPill label={data.optionOne} />
            <OptionPill label={data.optionTwo} />
          </div>
          <p className="font-medium text-slate-500" role="status">
            Your question is waiting for a response.
          </p>
        </div>
      ) : (
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <OptionPill label={data.optionOne} selected={data.selectedOption === data.optionOne} />
            <OptionPill label={data.optionTwo} selected={data.selectedOption === data.optionTwo} />
          </div>
          <p className="font-semibold text-emerald-600" role="status">
            Answered: {data.selectedOption}
          </p>
          {data.submittedAt && (
            <p className="text-xs text-slate-400">
              Submitted {new Date(data.submittedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <p className="break-all rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {answerUrl}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-300"
        >
          {copied ? "Copied! ✅" : "Copy Link Again"}
        </button>
      </div>

      <Link
        href="/"
        className="block w-full rounded-2xl border border-purple-200 px-6 py-2.5 text-center text-sm font-medium text-purple-600 transition hover:bg-purple-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-200"
      >
        ← Create another question
      </Link>
    </div>
  );
}

function OptionPill({ label, selected }: { label: string; selected?: boolean }) {
  return (
    <span
      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
        selected
          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white ring-4 ring-emerald-200"
          : "border border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {label}
    </span>
  );
}
