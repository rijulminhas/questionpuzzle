# Shareable Two-Choice Question App

A Next.js + TypeScript + Tailwind app: create a yes/no-style question, get a
unique shareable link, and send it to a friend. They open the link (on any
device or browser) and see both answers — the first is a normal clickable
button, the second one playfully dodges the cursor on hover (desktop) or
jumps away on tap (mobile) and can never actually be selected or submitted.
Once they pick the first answer and submit, it's locked permanently. You view
the result on a private results page.

## Architecture

- **Next.js App Router, React, TypeScript, Tailwind CSS** — same stack as
  before.
- **Persistence:** Postgres, via [`pg`](https://node-postgres.com/) (node-postgres),
  connecting to **Vercel Postgres (Neon)**. This replaced an earlier
  `node:sqlite`-based version: embedded SQLite looked like a good
  zero-dependency fit locally, but Vercel's serverless functions have a
  **read-only filesystem** outside of `/tmp` (and `/tmp` isn't shared across
  instances or persisted between invocations anyway), so it failed with
  `ENOENT ... mkdir '/var/task/data'` in production. A real network-reachable
  database is required for data that must survive across requests, instances,
  and devices — which is the whole point of this feature.
- **Mutations** go through Next.js **Server Actions** (`app/actions.ts`):
  `createQuestionAction` and `submitAnswerAction`. Both validate and trim
  input on the server — the client never writes to the database directly.
- **Reads for the two shareable pages** go through **Route Handlers**
  (`app/api/questions/[questionId]/route.ts` and
  `app/api/results/[resultsToken]/route.ts`), fetched client-side so the
  `/answer/[questionId]` and `/results/[resultsToken]` pages work for a
  receiver on a completely different device/browser than the sender.
- **One-time answer enforcement is at the database layer**, not the UI: the
  `answers` table has a `UNIQUE` constraint on `question_id`, and the insert
  in `lib/db.ts` catches the Postgres unique-violation error (`code 23505`)
  and reports `already_answered`. Postgres enforces this constraint
  atomically regardless of how many app instances are running concurrently,
  so two submissions racing at the same time are guaranteed to leave exactly
  one `ok` and one `already_answered` — verified directly against Postgres's
  constraint semantics (via an in-memory Postgres-compatible engine) before
  shipping this change.
- **Sender/receiver privacy:** a question has two separate tokens — the
  public `questionId` (used in `/answer/[questionId]`, answering only) and a
  private `resultsToken` (used in `/results/[resultsToken]`, viewing only).
  The results token is only ever returned once, directly to the sender who
  just created the question — it's never embedded in or reachable from the
  public answer page or its API response.
- **New dependency:** `pg` (runtime) and `@types/pg` (dev). `@types/node` was
  also bumped to `^22` to match the installed Node version.

### New/changed files

- `lib/db.ts` — Postgres schema + queries (the only module that touches the DB).
- `app/actions.ts` — Server Actions: create a question, submit an answer.
- `app/api/questions/[questionId]/route.ts` — public GET: question text/options + answered flag (no results token).
- `app/api/results/[resultsToken]/route.ts` — private GET: question + answer status + selected option + timestamp.
- `app/page.tsx`, `components/QuestionForm.tsx`, `components/ShareLinkCard.tsx` — create-question + share-link screen (one page, no navigation needed between them).
- `app/answer/[questionId]/page.tsx`, `components/AnswerCard.tsx` — receiver's answer screen.
- `app/results/[resultsToken]/page.tsx`, `components/ResultsView.tsx` — sender's results screen, polls every 4s until answered.
- `components/MovingAnswerButton.tsx` — the second answer is **never selectable**, by design: it dodges the cursor on hover (desktop) and jumps away on tap (mobile), indefinitely, on every interaction attempt (click, pointerdown, touchstart, keyboard focus, Enter/Space all evade instead of selecting). Only the first answer can be picked and submitted — this is a deliberate product choice (confirmed by request), not a bug or an oversight.
- Removed: `context/QuestionContext.tsx` and `app/question/page.tsx` (the old client-only, same-tab demo flow — incompatible with a receiver opening the link on another device).

## Database schema

```sql
CREATE TABLE questions (
  id TEXT PRIMARY KEY,              -- public token, used in /answer/[id]
  results_token TEXT NOT NULL UNIQUE, -- private token, used in /results/[token]
  question_text TEXT NOT NULL,
  option_one TEXT NOT NULL,
  option_two TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id TEXT NOT NULL UNIQUE REFERENCES questions(id), -- UNIQUE = one answer per question
  selected_option TEXT NOT NULL,
  submitted_at TEXT NOT NULL
);
```

No separate `status` column: a question's status is derived at read time
(`ANSWERED` if a row exists in `answers`, else `PENDING`) so there's a single
source of truth.

**Migrations:** none needed to run by hand. `lib/db.ts` runs
`CREATE TABLE IF NOT EXISTS` once per cold start (cached on the connection
pool), so the schema is created automatically the first time the app touches
the database — no separate migration step or CLI command required.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `POSTGRES_URL` | Yes (or `DATABASE_URL`) | A Postgres connection string, e.g. `postgres://user:password@host/dbname?sslmode=require`. |

No other secrets are needed — there's no auth, no third-party APIs.

### Setting it up on Vercel

1. In your Vercel project, go to **Storage → Create Database → Postgres**
   (this provisions a Neon-backed Postgres database and is included in
   Vercel's free Hobby tier).
2. Connect it to this project. Vercel automatically injects `POSTGRES_URL`
   (and a few related variables) into the project's environment for
   Production, Preview, and Development — no manual copy-pasting needed.
3. Redeploy. `lib/db.ts` creates the `questions`/`answers` tables
   automatically on first request.

## Local setup and run

Pull the same database credentials Vercel just created, via the
[Vercel CLI](https://vercel.com/docs/cli):

```bash
npm install
npx vercel link       # link this folder to your Vercel project, once
npx vercel env pull .env.local
npm run dev
```

(If you'd rather not share the production database with local development,
create a second Postgres database — e.g. a free one at
[neon.tech](https://neon.tech) — and put its connection string in
`.env.local` as `POSTGRES_URL=...` instead.)

Open [http://localhost:3000](http://localhost:3000). To try the receiver
flow, paste the generated `/answer/...` link into another browser/profile (or
an incognito window) to simulate a different device.

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # ESLint
```

## Pages

- `/` — create a question. On success, shows the share-link screen (no page
  navigation) with Copy Link, native Share (when supported by the browser),
  and a link to the results page.
- `/answer/[questionId]` — public, answer-only. Handles invalid link,
  already-answered, loading, and network-error states.
- `/results/[resultsToken]` — private, sender-only. Shows "waiting for a
  response" or the answer with a timestamp; auto-refreshes every 4 seconds
  until answered.

## Testing checklist

- [ ] Create a question with all three fields filled → share screen appears
      with a working `/answer/...` link.
- [ ] Leave a field empty (or whitespace-only) → validation message, no
      question created.
- [ ] Double-click "Create Question" quickly → only one question is created
      (button disables itself while pending).
- [ ] Open the `/answer/...` link in a different browser/incognito window →
      question and both options load correctly.
- [ ] Hover/move the mouse toward the second answer repeatedly → it keeps
      dodging indefinitely and can never actually be clicked or selected
      (the Submit button stays disabled). On a touch device, tapping it does
      the same — it jumps away instead of registering a tap.
- [ ] Tab to the second answer and press Enter/Space → it evades instead of
      selecting; Tab still moves focus past it to the rest of the page (no
      keyboard trap).
- [ ] Click the first answer → it highlights as selected; Submit Answer
      becomes enabled.
- [ ] Submit an answer → "Your answer has been submitted successfully!"
      appears, options disappear/lock.
- [ ] Refresh or reopen the same `/answer/...` link → "This question has
      already been answered."
- [ ] Open `/answer/` with a made-up/garbage id → "invalid or no longer
      exists" message, no crash.
- [ ] Open the `/results/...` link before answering → "waiting for a
      response."
- [ ] Open the `/results/...` link (or leave it open) after answering → shows
      the selected answer, highlighted, with a submitted date/time, without a
      manual refresh (polling).
- [ ] Copy Link / Share buttons on both the share screen and results screen
      work and show feedback.
- [ ] Create a second question → gets its own id/link; the first question's
      link and result are unaffected.
- [ ] Turn off the network (or stop the dev server) mid-submission → a
      friendly error is shown instead of a silent failure or crash.
