import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getAnswerForQuestion, getQuestionByResultsToken } from "@/lib/db";
import type { ResultsDTO } from "@/types/question";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resultsToken: string }> },
) {
  await connection();
  const { resultsToken } = await params;

  const question = getQuestionByResultsToken(resultsToken);
  if (!question) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const answer = getAnswerForQuestion(question.id);

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
