# Playful Two-Choice Question Form

A small Next.js + TypeScript + Tailwind app: create a question with two answer
choices, then share the interactive result screen where the first answer is
clickable and the second answer playfully dodges the cursor.

## Getting Started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Create Your Question** (`/`) — enter a question and two answers, with
  validation on all three fields.
- **Interactive Question Display** (`/question`) — shows the question and
  both answers. The first answer is a normal clickable button that reveals a
  success message. The second answer moves to a new spot whenever the cursor
  approaches, is tapped on touch devices, or receives keyboard focus, and can
  never be selected. Visiting `/question` directly (no question in state)
  redirects back to the form.

State is held entirely in React (via a context provider in
`app/layout.tsx`) — there is no backend, database, or `localStorage`, so
data does not persist across a full page refresh.

## Project Structure

- `app/page.tsx` — question creation form page.
- `app/question/page.tsx` — interactive question display page.
- `context/QuestionContext.tsx` — client-side state shared between the two pages.
- `components/QuestionForm.tsx` — form fields and validation.
- `components/QuestionCard.tsx` — question/answer layout and success message.
- `components/MovingAnswerButton.tsx` — evasive movement and pointer-interaction logic for the second answer.

## Scripts

- `npm run dev` — start the dev server.
- `npm run build` — production build.
- `npm run lint` — run ESLint.
