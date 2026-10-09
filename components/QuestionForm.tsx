"use client";

import { useActionState } from "react";
import { createQuestionAction } from "@/app/actions";
import type { CreateQuestionState } from "@/types/question";

interface QuestionFormProps {
  onCreated: (questionId: string, resultsToken: string) => void;
}

const initialState: CreateQuestionState = {};

export default function QuestionForm({ onCreated }: QuestionFormProps) {
  const [state, formAction, pending] = useActionState(async (
    prevState: CreateQuestionState,
    formData: FormData,
  ) => {
    const result = await createQuestionAction(prevState, formData);
    if (result.questionId && result.resultsToken) {
      onCreated(result.questionId, result.resultsToken);
    }
    return result;
  }, initialState);

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-3xl border border-white/60 bg-white/90 p-8 shadow-xl shadow-purple-200/50 backdrop-blur"
    >
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Create Your Question 💭</h1>
        <p className="text-sm text-slate-500">
          Ask something playful — you&apos;ll get a link to send to a friend.
        </p>
      </div>

      <Field
        id="question"
        name="question"
        label="Question"
        placeholder="Do you like me?"
        multiline
      />
      <Field id="firstAnswer" name="firstAnswer" label="First answer choice" placeholder="Yes" />
      <Field id="secondAnswer" name="secondAnswer" label="Second answer choice" placeholder="No" />

      {state.error && (
        <p role="alert" className="text-sm font-medium text-red-500">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-purple-300/50 transition-transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        {pending ? "Creating…" : "Create Question"}
      </button>
    </form>
  );
}

interface FieldProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
}

function Field({ id, name, label, placeholder, multiline }: FieldProps) {
  const sharedClassName =
    "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 placeholder:text-slate-400 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-200";

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          placeholder={placeholder}
          rows={2}
          required
          maxLength={300}
          className={`${sharedClassName} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type="text"
          placeholder={placeholder}
          required
          maxLength={100}
          className={sharedClassName}
        />
      )}
    </div>
  );
}
