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
- **Persistence:** [`node:sqlite`](https://nodejs.org/api/sqlite.html)
  (`DatabaseSync`), Node's built-in synchronous SQLite driver (stable enough
  for this use case, ships with Node 22+, **no extra dependency**). The
  database file lives at `data/app.db` (created automatically, gitignored).
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
  in `lib/db.ts` catches the constraint violation and reports
  `already_answered`. Because `node:sqlite` is synchronous and Node is
  single-threaded, two submissions that race in the same server process are
  naturally serialized — only one `INSERT` can win. (This guarantee is
  per-process; it assumes you run a single Node server instance, which fits
  this project's scope. A multi-instance deployment would need a real
  client-server database such as Postgres instead of embedded SQLite.)
- **Sender/receiver privacy:** a question has two separate tokens — the
  public `questionId` (used in `/answer/[questionId]`, answering only) and a
  private `resultsToken` (used in `/results/[resultsToken]`, viewing only).
  The results token is only ever returned once, directly to the sender who
  just created the question — it's never embedded in or reachable from the
  public answer page or its API response.
- **New dependency:** none at runtime. `@types/node` was bumped to `^22` (dev
  only) to match the installed Node version and pick up `node:sqlite` types.

### New/changed files

- `lib/db.ts` — SQLite schema + queries (the only module that touches the DB).
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id TEXT NOT NULL UNIQUE REFERENCES questions(id), -- UNIQUE = one answer per question
  selected_option TEXT NOT NULL,
  submitted_at TEXT NOT NULL
);
```

No separate `status` column: a question's status is derived at read time
(`ANSWERED` if a row exists in `answers`, else `PENDING`) so there's a single
source of truth.

**Migrations:** none needed to run by hand. `lib/db.ts` runs
`CREATE TABLE IF NOT EXISTS` on first use, so the schema is created
automatically the first time the app touches the database (e.g. on first
`npm run dev` or `npm run build`).

## Environment variables

None required. There are no secrets, external APIs, or third-party services
— the SQLite file path is a local relative path (`data/app.db`).

## Local setup and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To try the receiver
flow, paste the generated `/answer/...` link into another browser/profile (or
an incognito window) to simulate a different device.

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # ESLint
```

The SQLite file is created at `data/app.db` on first run; delete it to reset
all data.

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
