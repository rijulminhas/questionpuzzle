import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

export interface QuestionRecord {
  id: string;
  resultsToken: string;
  questionText: string;
  optionOne: string;
  optionTwo: string;
  createdAt: string;
}

export interface AnswerRecord {
  questionId: string;
  selectedOption: string;
  submittedAt: string;
}

export type SubmitAnswerResult = "ok" | "already_answered" | "not_found";

const globalForDb = globalThis as unknown as { __questionDb?: DatabaseSync };

function openDatabase(): DatabaseSync {
  const dataDir = path.join(process.cwd(), "data");
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, "app.db"));
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      results_token TEXT NOT NULL UNIQUE,
      question_text TEXT NOT NULL,
      option_one TEXT NOT NULL,
      option_two TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id TEXT NOT NULL UNIQUE REFERENCES questions(id),
      selected_option TEXT NOT NULL,
      submitted_at TEXT NOT NULL
    );
  `);
  return db;
}

function getDb(): DatabaseSync {
  if (!globalForDb.__questionDb) {
    globalForDb.__questionDb = openDatabase();
  }
  return globalForDb.__questionDb;
}

function rowToQuestion(row: Record<string, unknown>): QuestionRecord {
  return {
    id: row.id as string,
    resultsToken: row.results_token as string,
    questionText: row.question_text as string,
    optionOne: row.option_one as string,
    optionTwo: row.option_two as string,
    createdAt: row.created_at as string,
  };
}

function rowToAnswer(row: Record<string, unknown>): AnswerRecord {
  return {
    questionId: row.question_id as string,
    selectedOption: row.selected_option as string,
    submittedAt: row.submitted_at as string,
  };
}

export interface CreateQuestionInput {
  questionText: string;
  optionOne: string;
  optionTwo: string;
}

export function createQuestionRecord(input: CreateQuestionInput): QuestionRecord {
  const db = getDb();
  const record: QuestionRecord = {
    id: randomUUID(),
    resultsToken: randomUUID(),
    questionText: input.questionText,
    optionOne: input.optionOne,
    optionTwo: input.optionTwo,
    createdAt: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO questions (id, results_token, question_text, option_one, option_two, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    record.id,
    record.resultsToken,
    record.questionText,
    record.optionOne,
    record.optionTwo,
    record.createdAt,
  );

  return record;
}

export function getQuestionById(id: string): QuestionRecord | undefined {
  const row = getDb().prepare("SELECT * FROM questions WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? rowToQuestion(row) : undefined;
}

export function getQuestionByResultsToken(resultsToken: string): QuestionRecord | undefined {
  const row = getDb()
    .prepare("SELECT * FROM questions WHERE results_token = ?")
    .get(resultsToken) as Record<string, unknown> | undefined;
  return row ? rowToQuestion(row) : undefined;
}

export function getAnswerForQuestion(questionId: string): AnswerRecord | undefined {
  const row = getDb()
    .prepare("SELECT * FROM answers WHERE question_id = ?")
    .get(questionId) as Record<string, unknown> | undefined;
  return row ? rowToAnswer(row) : undefined;
}

export function submitAnswerRecord(
  questionId: string,
  selectedOption: string,
): SubmitAnswerResult {
  const db = getDb();
  const question = getQuestionById(questionId);
  if (!question) return "not_found";

  try {
    db.prepare(
      `INSERT INTO answers (question_id, selected_option, submitted_at) VALUES (?, ?, ?)`,
    ).run(questionId, selectedOption, new Date().toISOString());
    return "ok";
  } catch (err) {
    const isUniqueViolation =
      err instanceof Error &&
      (err as NodeJS.ErrnoException).code === "ERR_SQLITE_ERROR" &&
      /UNIQUE constraint failed/.test(err.message);
    if (isUniqueViolation) return "already_answered";
    throw err;
  }
}
