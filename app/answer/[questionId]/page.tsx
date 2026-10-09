"use client";

import { Suspense, use, useEffect, useState } from "react";
import AnswerCard from "@/components/AnswerCard";
import type { PublicQuestionDTO } from "@/types/question";

type FetchState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "not_found" }
  | { status: "ready"; data: PublicQuestionDTO };

export default function AnswerPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 px-4 py-10">
      <div className="w-full max-w-lg">
        <Suspense fallback={<StatusCard message="Loading question…" />}>
          <AnswerPageContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}

function AnswerPageContent({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = use(params);
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/questions/${questionId}`, { cache: "no-store" });
        if (cancelled) return;
        if (res.status === 404) {
          setState({ status: "not_found" });
          return;
        }
        if (!res.ok) {
          setState({ status: "error" });
          return;
        }
        const data: PublicQuestionDTO = await res.json();
        setState({ status: "ready", data });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [questionId]);

  if (state.status === "loading") {
    return <StatusCard message="Loading question…" />;
  }

  if (state.status === "not_found") {
    return <StatusCard message="This question link is invalid or no longer exists." isAlert />;
  }

  if (state.status === "error") {
    return (
      <StatusCard
        message="Something went wrong loading this question. Please check your connection and try again."
        isAlert
      />
    );
  }

  return (
    <AnswerCard
      questionId={questionId}
      questionText={state.data.questionText}
      optionOne={state.data.optionOne}
      optionTwo={state.data.optionTwo}
      initiallyAnswered={state.data.answered}
    />
  );
}

function StatusCard({ message, isAlert }: { message: string; isAlert?: boolean }) {
  return (
    <div
      className="rounded-3xl border border-white/60 bg-white/90 p-8 text-center shadow-xl shadow-purple-200/50 backdrop-blur"
      role={isAlert ? "alert" : "status"}
    >
      <p className="font-medium text-slate-600">{message}</p>
    </div>
  );
}
