"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import { useQuestion } from "@/context/QuestionContext";

export default function QuestionPage() {
  const router = useRouter();
  const { question, clearQuestion } = useQuestion();

  useEffect(() => {
    if (!question) {
      router.replace("/");
    }
  }, [question, router]);

  if (!question) return null;

  const handleBack = () => {
    clearQuestion();
    router.push("/");
  };

  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 px-4 py-10">
      <div className="w-full max-w-lg">
        <QuestionCard question={question} onBack={handleBack} />
      </div>
    </main>
  );
}
