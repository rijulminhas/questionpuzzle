"use client";

import { useState } from "react";
import Link from "next/link";

interface ShareLinkCardProps {
  questionId: string;
  resultsToken: string;
  onCreateAnother: () => void;
}

export default function ShareLinkCard({
  questionId,
  resultsToken,
  onCreateAnother,
}: ShareLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const answerUrl = `${origin}/answer/${questionId}`;
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answerUrl);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError(true);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "I have a question for you",
        text: "Answer my question:",
        url: answerUrl,
      });
    } catch {
      // User cancelled the share sheet or it's unsupported — no action needed.
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-white/60 bg-white/90 p-8 shadow-xl shadow-purple-200/50 backdrop-blur">
      <div className="space-y-1 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-purple-500">
          Your question is ready 🎉
        </p>
        <h1 className="text-2xl font-bold text-slate-800">Send this link to your friend</h1>
      </div>

      <div className="space-y-2">
        <p
          className="break-all rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
          aria-label="Shareable question link"
        >
          {answerUrl}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-300"
          >
            {copied ? "Copied! ✅" : "Copy Link"}
          </button>
          {canShare && (
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-semibold text-purple-600 transition hover:bg-purple-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-200"
            >
              Share…
            </button>
          )}
        </div>
        {copyError && (
          <p role="alert" className="text-sm text-red-500">
            Couldn&apos;t copy automatically — select and copy the link above.
          </p>
        )}
      </div>

      <Link
        href={`/results/${resultsToken}`}
        className="block w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-center text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
      >
        View Results →
      </Link>
      <p className="text-center text-xs text-slate-400">
        Keep this results link private — anyone who has it can see the answer.
      </p>

      <button
        type="button"
        onClick={onCreateAnother}
        className="w-full rounded-2xl border border-purple-200 px-6 py-2.5 text-sm font-medium text-purple-600 transition hover:bg-purple-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-200"
      >
        ← Create another question
      </button>
    </div>
  );
}
