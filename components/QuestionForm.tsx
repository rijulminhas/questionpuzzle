"use client";

import { useState, type FormEvent } from "react";
import type { Question } from "@/types/question";

interface QuestionFormProps {
  onSubmit: (data: Question) => void;
}

type Errors = Partial<Record<keyof Question, string>>;

export default function QuestionForm({ onSubmit }: QuestionFormProps) {
  const [question, setQuestionText] = useState("");
  const [firstAnswer, setFirstAnswer] = useState("");
  const [secondAnswer, setSecondAnswer] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): Errors => {
    const nextErrors: Errors = {};
    if (!question.trim()) nextErrors.question = "Please enter a question.";
    if (!firstAnswer.trim()) nextErrors.firstAnswer = "Please enter the first answer.";
    if (!secondAnswer.trim()) nextErrors.secondAnswer = "Please enter the second answer.";
    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      question: question.trim(),
      firstAnswer: firstAnswer.trim(),
      secondAnswer: secondAnswer.trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-3xl border border-white/60 bg-white/90 p-8 shadow-xl shadow-purple-200/50 backdrop-blur"
    >
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Create Your Question 💭</h1>
        <p className="text-sm text-slate-500">
          Ask something playful — your friend will see it on the next screen.
        </p>
      </div>

      <Field
        id="question"
        label="Question"
        value={question}
        onChange={setQuestionText}
        placeholder="Do you like me?"
        error={errors.question}
        multiline
      />
      <Field
        id="firstAnswer"
        label="First answer choice"
        value={firstAnswer}
        onChange={setFirstAnswer}
        placeholder="Yes"
        error={errors.firstAnswer}
      />
      <Field
        id="secondAnswer"
        label="Second answer choice"
        value={secondAnswer}
        onChange={setSecondAnswer}
        placeholder="No"
        error={errors.secondAnswer}
      />

      <button
        type="submit"
        className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-purple-300/50 transition-transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 active:scale-[0.99]"
      >
        Create Question
      </button>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  multiline?: boolean;
}

function Field({ id, label, value, onChange, placeholder, error, multiline }: FieldProps) {
  const describedBy = error ? `${id}-error` : undefined;
  const sharedClassName =
    "w-full rounded-xl border px-4 py-2.5 text-slate-800 placeholder:text-slate-400 transition focus:outline-none focus-visible:ring-4 " +
    (error
      ? "border-red-300 focus-visible:ring-red-200"
      : "border-slate-200 focus-visible:ring-purple-200");

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={2}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${sharedClassName} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={sharedClassName}
        />
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
