"use client";

import { useRef, useState, useTransition } from "react";
import MovingAnswerButton from "@/components/MovingAnswerButton";
import { submitAnswerAction } from "@/app/actions";
import type { SubmitAnswerState } from "@/types/question";

interface AnswerCardProps {
  questionId: string;
  questionText: string;
  optionOne: string;
  optionTwo: string;
  initiallyAnswered: boolean;
}

export default function AnswerCard({
  questionId,
  questionText,
  optionOne,
  optionTwo,
  initiallyAnswered,
}: AnswerCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitAnswerState | null>(
    initiallyAnswered ? { status: "already_answered" } : null,
  );
  const [isPending, startTransition] = useTransition();

  const zoneRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  const locked = result?.status === "success" || result?.status === "already_answered";

  const handleSubmit = () => {
    if (!selected || locked) return;
    startTransition(async () => {
      try {
        const outcome = await submitAnswerAction(questionId, selected);
        setResult(outcome);
      } catch {
        setResult({ status: "error", error: "Network error. Please try again." });
      }
    });
  };

  if (result?.status === "success") {
    return (
      <div className="space-y-4 rounded-3xl border border-white/60 bg-white/90 p-8 text-center shadow-xl shadow-purple-200/50 backdrop-blur">
        <h1 className="text-2xl font-bold text-slate-800">{questionText}</h1>
        <p className="text-lg font-medium text-emerald-600" role="status">
          Your answer has been submitted successfully! 🎉
        </p>
        <p className="text-sm text-slate-500">You selected: {selected}</p>
      </div>
    );
  }

  if (result?.status === "already_answered") {
    return (
      <div className="space-y-4 rounded-3xl border border-white/60 bg-white/90 p-8 text-center shadow-xl shadow-purple-200/50 backdrop-blur">
        <h1 className="text-2xl font-bold text-slate-800">{questionText}</h1>
        <p className="text-base font-medium text-slate-600" role="status">
          This question has already been answered.
        </p>
      </div>
    );
  }

  if (result?.status === "not_found") {
    return (
      <div className="space-y-4 rounded-3xl border border-white/60 bg-white/90 p-8 text-center shadow-xl shadow-purple-200/50 backdrop-blur">
        <p className="text-base font-medium text-slate-600" role="alert">
          This question could not be found. The link may be invalid.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-white/60 bg-white/90 p-8 shadow-xl shadow-purple-200/50 backdrop-blur">
      <div className="space-y-1 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-purple-500">
          A Little Question for You 💌
        </p>
        <h1 id="question-heading" className="text-2xl font-bold text-slate-800">
          {questionText}
        </h1>
      </div>

      <div
        ref={zoneRef}
        className="relative h-56 touch-none overflow-hidden rounded-2xl border border-purple-100 bg-purple-50/60 sm:h-64"
        role="group"
        aria-labelledby="question-heading"
      >
        <button
          ref={firstButtonRef}
          type="button"
          onClick={() => setSelected(optionOne)}
          aria-pressed={selected === optionOne}
          className={`absolute left-[8%] top-1/2 -translate-y-1/2 rounded-2xl px-6 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 active:scale-95 ${
            selected === optionOne
              ? "scale-105 bg-gradient-to-r from-emerald-500 to-teal-600 ring-4 ring-emerald-300"
              : "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-emerald-200/60"
          }`}
        >
          {optionOne}
        </button>

        <MovingAnswerButton label={optionTwo} zoneRef={zoneRef} obstacleRef={firstButtonRef} />
      </div>

      {result?.status === "error" && (
        <p role="alert" className="text-center text-sm font-medium text-red-500">
          {result.error ?? "Something went wrong. Please try again."}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selected || isPending}
        className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-purple-300/50 transition-transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        {isPending ? "Submitting…" : "Submit Answer"}
      </button>
    </div>
  );
}
