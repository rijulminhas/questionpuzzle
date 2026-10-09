"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Question } from "@/types/question";

interface QuestionContextValue {
  question: Question | null;
  setQuestion: (question: Question) => void;
  clearQuestion: () => void;
}

const QuestionContext = createContext<QuestionContextValue | undefined>(undefined);

export function QuestionProvider({ children }: { children: ReactNode }) {
  const [question, setQuestionState] = useState<Question | null>(null);

  const value = useMemo<QuestionContextValue>(
    () => ({
      question,
      setQuestion: (next) => setQuestionState(next),
      clearQuestion: () => setQuestionState(null),
    }),
    [question],
  );

  return <QuestionContext.Provider value={value}>{children}</QuestionContext.Provider>;
}

export function useQuestion() {
  const context = useContext(QuestionContext);
  if (!context) {
    throw new Error("useQuestion must be used within a QuestionProvider");
  }
  return context;
}
