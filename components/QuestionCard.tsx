"use client";

import { useRef, useState } from "react";
import type { Question } from "@/types/question";
import MovingAnswerButton from "@/components/MovingAnswerButton";

interface QuestionCardProps {
  question: Question;
  onBack: () => void;
}

export default function QuestionCard({ question, onBack }: QuestionCardProps) {
  const [selected, setSelected] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="space-y-6 rounded-3xl border border-white/60 bg-white/90 p-8 shadow-xl shadow-purple-200/50 backdrop-blur">
      <div className="space-y-1 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-purple-500">
          A Little Question for You 💌
        </p>
        <h1 id="question-heading" className="text-2xl font-bold text-slate-800">
          {question.question}
        </h1>
      </div>

      {selected ? (
        <p className="text-center text-lg font-medium text-emerald-600" role="status">
          You selected {question.firstAnswer}! 😊
        </p>
      ) : (
        <div
          ref={zoneRef}
          className="relative h-56 touch-none overflow-hidden rounded-2xl border border-purple-100 bg-purple-50/60 sm:h-64"
          aria-labelledby="question-heading"
        >
          <button
            ref={firstButtonRef}
            type="button"
            onClick={() => setSelected(true)}
            className="absolute left-[8%] top-1/2 -translate-y-1/2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-200/60 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 active:scale-95"
          >
            {question.firstAnswer}
          </button>

          <MovingAnswerButton
            label={question.secondAnswer}
            zoneRef={zoneRef}
            obstacleRef={firstButtonRef}
          />
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        className="w-full rounded-2xl border border-purple-200 px-6 py-2.5 text-sm font-medium text-purple-600 transition hover:bg-purple-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-200"
      >
        ← Create another question
      </button>
    </div>
  );
}
