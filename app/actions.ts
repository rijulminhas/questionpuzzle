"use server";

import {
  createQuestionRecord,
  getQuestionById,
  submitAnswerRecord,
} from "@/lib/db";
import type { CreateQuestionState, SubmitAnswerState } from "@/types/question";

const MAX_QUESTION_LENGTH = 300;
const MAX_ANSWER_LENGTH = 100;

export async function createQuestionAction(
  _prevState: CreateQuestionState,
  formData: FormData,
): Promise<CreateQuestionState> {
  const questionText = String(formData.get("question") ?? "").trim();
  const optionOne = String(formData.get("firstAnswer") ?? "").trim();
  const optionTwo = String(formData.get("secondAnswer") ?? "").trim();

  if (!questionText || !optionOne || !optionTwo) {
    return { error: "Please fill in the question and both answers." };
  }
  if (questionText.length > MAX_QUESTION_LENGTH) {
    return { error: `Question must be ${MAX_QUESTION_LENGTH} characters or fewer.` };
  }
  if (optionOne.length > MAX_ANSWER_LENGTH || optionTwo.length > MAX_ANSWER_LENGTH) {
    return { error: `Each answer must be ${MAX_ANSWER_LENGTH} characters or fewer.` };
  }
  if (optionOne.toLowerCase() === optionTwo.toLowerCase()) {
    return { error: "The two answers must be different." };
  }

  const record = createQuestionRecord({ questionText, optionOne, optionTwo });

  return { questionId: record.id, resultsToken: record.resultsToken };
}

export async function submitAnswerAction(
  questionId: string,
  selectedOption: string,
): Promise<SubmitAnswerState> {
  const question = getQuestionById(questionId);
  if (!question) {
    return { status: "not_found" };
  }

  if (selectedOption !== question.optionOne && selectedOption !== question.optionTwo) {
    return { status: "error", error: "That is not a valid answer for this question." };
  }

  const result = submitAnswerRecord(questionId, selectedOption);
  if (result === "ok") return { status: "success" };
  if (result === "already_answered") return { status: "already_answered" };
  return { status: "not_found" };
}
