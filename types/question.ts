export interface PublicQuestionDTO {
  questionText: string;
  optionOne: string;
  optionTwo: string;
  answered: boolean;
}

export interface ResultsDTO {
  questionId: string;
  questionText: string;
  optionOne: string;
  optionTwo: string;
  status: "PENDING" | "ANSWERED";
  selectedOption: string | null;
  submittedAt: string | null;
}

export interface CreateQuestionState {
  error?: string;
  questionId?: string;
  resultsToken?: string;
}

export type SubmitAnswerStatus = "success" | "already_answered" | "not_found" | "error";

export interface SubmitAnswerState {
  status: SubmitAnswerStatus;
  error?: string;
}
