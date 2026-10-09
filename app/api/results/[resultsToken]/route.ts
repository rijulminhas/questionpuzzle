import { NextResponse } from "next/server";
import { getAnswerForQuestion, getQuestionByResultsToken } from "@/lib/db";
import type { ResultsDTO } from "@/types/question";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resultsToken: string }> },
) {
  const { resultsToken } = await params;

  const question = await getQuestionByResultsToken(resultsToken);
  if (!question) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const answer = await getAnswerForQuestion(question.id);

  const body: ResultsDTO = {
    questionId: question.id,
    questionText: question.questionText,
    optionOne: question.optionOne,
    optionTwo: question.optionTwo,
    status: answer ? "ANSWERED" : "PENDING",
    selectedOption: answer?.selectedOption ?? null,
    submittedAt: answer?.submittedAt ?? null,
  };

  return NextResponse.json(body);
}
