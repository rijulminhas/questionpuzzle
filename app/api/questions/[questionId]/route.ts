import { NextResponse } from "next/server";
import { getAnswerForQuestion, getQuestionById } from "@/lib/db";
import type { PublicQuestionDTO } from "@/types/question";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ questionId: string }> },
) {
  const { questionId } = await params;

  const question = await getQuestionById(questionId);
  if (!question) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const answer = await getAnswerForQuestion(questionId);

  const body: PublicQuestionDTO = {
    questionText: question.questionText,
    optionOne: question.optionOne,
    optionTwo: question.optionTwo,
    answered: Boolean(answer),
  };

  return NextResponse.json(body);
}
