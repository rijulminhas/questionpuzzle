"use client";

import { useState } from "react";
import QuestionForm from "@/components/QuestionForm";
import ShareLinkCard from "@/components/ShareLinkCard";

interface CreatedQuestion {
  questionId: string;
  resultsToken: string;
}

export default function HomePage() {
  const [created, setCreated] = useState<CreatedQuestion | null>(null);

  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 px-4 py-10">
      <div className="w-full max-w-md">
        {created ? (
          <ShareLinkCard
            questionId={created.questionId}
            resultsToken={created.resultsToken}
            onCreateAnother={() => setCreated(null)}
          />
        ) : (
          <QuestionForm
            onCreated={(questionId, resultsToken) => setCreated({ questionId, resultsToken })}
          />
        )}
      </div>
    </main>
  );
}
