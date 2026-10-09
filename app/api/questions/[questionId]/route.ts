import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getAnswerForQuestion, getQuestionById } from "@/lib/db";
import type { PublicQuestionDTO } from "@/types/question";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ questionId: string }> },
) {
  await connection();
  const { questionId } = await params;

  const question = getQuestionById(questionId);
  if (!question) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const answer = getAnswerForQuestion(questionId);

  const body: PublicQuestionDTO = {
    questionText: question.questionText,
    optionOne: question.optionOne,
    optionTwo: question.optionTwo,
    answered: Boolean(answer),
  };

  return NextResponse.json(body);
}
