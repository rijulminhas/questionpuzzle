"use client";

import { Suspense, use } from "react";
import ResultsView from "@/components/ResultsView";

export default function ResultsPage({
  params,
}: {
  params: Promise<{ resultsToken: string }>;
}) {
  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 px-4 py-10">
      <div className="w-full max-w-lg">
        <Suspense
          fallback={
            <div
              className="rounded-3xl border border-white/60 bg-white/90 p-8 text-center shadow-xl shadow-purple-200/50 backdrop-blur"
              role="status"
            >
              <p className="text-slate-500">Loading results…</p>
            </div>
          }
        >
          <ResultsPageContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}

function ResultsPageContent({
  params,
}: {
  params: Promise<{ resultsToken: string }>;
}) {
  const { resultsToken } = use(params);
  return <ResultsView resultsToken={resultsToken} />;
}
