"use client";

import { useRouter } from "next/navigation";
import QuestionForm from "@/components/QuestionForm";
import { useQuestion } from "@/context/QuestionContext";
import type { Question } from "@/types/question";

export default function HomePage() {
  const router = useRouter();
  const { setQuestion } = useQuestion();

  const handleSubmit = (data: Question) => {
    setQuestion(data);
    router.push("/question");
  };

  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 px-4 py-10">
      <div className="w-full max-w-md">
        <QuestionForm onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
