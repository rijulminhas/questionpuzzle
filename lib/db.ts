import { Pool } from "pg";
import { randomUUID } from "node:crypto";

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

const globalForDb = globalThis as unknown as {
  __questionPool?: Pool;
  __questionSchemaReady?: Promise<void>;
};

function getPool(): Pool {
  if (!globalForDb.__questionPool) {
    const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "Missing POSTGRES_URL (or DATABASE_URL) environment variable. " +
          "Connect a Postgres database to this project (e.g. the Vercel Postgres / Neon " +
          "integration) and ensure its connection string is available at runtime.",
      );
    }
    const needsSsl =
      connectionString.includes("sslmode=require") || connectionString.includes("neon.tech");
    globalForDb.__questionPool = new Pool({
      connectionString,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    });
  }
  return globalForDb.__questionPool;
}

function ensureSchema(): Promise<void> {
  if (!globalForDb.__questionSchemaReady) {
    globalForDb.__questionSchemaReady = getPool()
      .query(
        `
        CREATE TABLE IF NOT EXISTS questions (
          id TEXT PRIMARY KEY,
          results_token TEXT NOT NULL UNIQUE,
          question_text TEXT NOT NULL,
          option_one TEXT NOT NULL,
          option_two TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS answers (
          id SERIAL PRIMARY KEY,
          question_id TEXT NOT NULL UNIQUE REFERENCES questions(id),
          selected_option TEXT NOT NULL,
          submitted_at TEXT NOT NULL
        );
      `,
      )
      .then(() => undefined);
  }
  return globalForDb.__questionSchemaReady;
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

export async function createQuestionRecord(input: CreateQuestionInput): Promise<QuestionRecord> {
  await ensureSchema();
  const record: QuestionRecord = {
    id: randomUUID(),
    resultsToken: randomUUID(),
    questionText: input.questionText,
    optionOne: input.optionOne,
    optionTwo: input.optionTwo,
    createdAt: new Date().toISOString(),
  };

  await getPool().query(
    `INSERT INTO questions (id, results_token, question_text, option_one, option_two, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      record.id,
      record.resultsToken,
      record.questionText,
      record.optionOne,
      record.optionTwo,
      record.createdAt,
    ],
  );

  return record;
}

export async function getQuestionById(id: string): Promise<QuestionRecord | undefined> {
  await ensureSchema();
  const { rows } = await getPool().query("SELECT * FROM questions WHERE id = $1", [id]);
  return rows[0] ? rowToQuestion(rows[0]) : undefined;
}

export async function getQuestionByResultsToken(
  resultsToken: string,
): Promise<QuestionRecord | undefined> {
  await ensureSchema();
  const { rows } = await getPool().query("SELECT * FROM questions WHERE results_token = $1", [
    resultsToken,
  ]);
  return rows[0] ? rowToQuestion(rows[0]) : undefined;
}

export async function getAnswerForQuestion(
  questionId: string,
): Promise<AnswerRecord | undefined> {
  await ensureSchema();
  const { rows } = await getPool().query("SELECT * FROM answers WHERE question_id = $1", [
    questionId,
  ]);
  return rows[0] ? rowToAnswer(rows[0]) : undefined;
}

export async function submitAnswerRecord(
  questionId: string,
  selectedOption: string,
): Promise<SubmitAnswerResult> {
  await ensureSchema();
  const question = await getQuestionById(questionId);
  if (!question) return "not_found";

  try {
    await getPool().query(
      `INSERT INTO answers (question_id, selected_option, submitted_at) VALUES ($1, $2, $3)`,
      [questionId, selectedOption, new Date().toISOString()],
    );
    return "ok";
  } catch (err) {
    const isUniqueViolation = (err as { code?: string }).code === "23505";
    if (isUniqueViolation) return "already_answered";
    throw err;
  }
}
