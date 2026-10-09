# Feature Upgrade: Shareable Questions, One-Time Answers, and Results Tracking

I have an existing small web application built with **Next.js App Router, React, TypeScript, and Tailwind CSS**. I want to upgrade it into a shareable question-and-answer app.

## 1. Main Goal

A user should be able to create a question with exactly two answer options, generate a unique shareable link, and send that link to another person.

The receiver should open the link, answer the question only once, and submit their response. After submission, the answer must be locked permanently for that question link. The original sender should be able to open their results page and see the answer submitted by the receiver.

## 2. User Flow

### Step 1: Create a Question

Create a page where the sender can enter:

- **Question:** A required text field.
- **Answer Option 1:** A required text field.
- **Answer Option 2:** A required text field.

Include a clear **Create Question** button.

Validation requirements:
- All fields are required.
- Trim unnecessary whitespace.
- Prevent submission if any field is empty.
- Display friendly validation messages.
- Do not allow accidental duplicate submissions from repeated clicks.

### Step 2: Generate a Shareable Link

After creating the question:

- Generate a unique, hard-to-guess question ID or token.
- Create a public URL such as `/answer/[questionId]`.
- Display the shareable link prominently.
- Add a **Copy Link** button.
- Show a success message when the link is copied.
- Provide a native share option when supported by the browser.
- Let the sender share the link through WhatsApp, messaging apps, email, or any other app that accepts URLs.
- Include a separate **View Results** link or button for the sender.

The receiver must be able to open the link on another device or browser.

### Step 3: Receiver Opens the Link

When the receiver opens the shared URL, display a clean page containing:

- The original question.
- The two answer options as clickable buttons or radio-style cards.
- A **Submit Answer** button.
- A simple, friendly interface that works on desktop and mobile.

The receiver should not need to create an account or log in.

The receiver can select only one of the two answers.

Before submission, allow the receiver to change their selection. Once the answer has been successfully submitted, lock the response permanently.

### Step 4: One-Time Answer Submission

Each generated question link must accept only one successful answer submission.

Requirements:

- The receiver can submit exactly one answer per question.
- After a successful submission, both options and the submission button must become disabled or disappear.
- Show a confirmation message such as: “Your answer has been submitted successfully!”
- If the same receiver refreshes the page or reopens the link after submitting, show a message such as: “This question has already been answered.”
- Do not allow another answer to overwrite the original response.
- If two submissions occur at nearly the same time, only one must succeed.
- Display an appropriate message if someone tries to submit an answer after the question has already been answered.

**Important:** Enforce one-time submission on the server/database, not only in the frontend. Disabling a button in React is not sufficient protection.

For this version, one question link should have a maximum of one successful answer submission. It is not a poll or a multiple-response survey.

### Step 5: Sender Views the Result

Create a results page accessible to the original sender through a separate results link.

The results page should display:

- The original question.
- Both answer options.
- The answer selected by the receiver.
- Submission status: **Answered** or **Waiting for an answer**.
- Submission date and time, if available.
- A clear visual indication of the selected answer.

If the receiver has not answered yet, display a message such as: “Your question is waiting for a response.”

Once the receiver submits their answer, the sender should see the result after refreshing or reopening the results page. If practical, implement automatic result updates without requiring a manual refresh.

The sender should also be able to copy and share the question link again.

### Step 6: Create Another Question

Provide a **Create Another Question** button.

When clicked, the user should be taken to a fresh question form with empty fields.

Creating another question must:

- Generate a new unique question ID and shareable link.
- Create an independent answer record.
- Leave previous questions and their results unchanged.
- Never reset, reopen, or overwrite an already answered question.

Each question must have its own independent lifecycle and result.

## 3. Technical Requirements

Use the existing project's framework and coding conventions wherever possible.

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Reusable React components
- Responsive design
- Proper form validation
- Loading, success, and error states
- Clear and maintainable code

### Backend and Database

This feature requires persistent shared data because the sender and receiver may use different devices or browsers.

If the current application is frontend-only, introduce the minimum backend and database functionality required. Use an appropriate persistent database and secure server-side endpoints or Next.js Server Actions.

Suggested data structure:

**Question**
- `id` or unique token
- `questionText`
- `optionOne`
- `optionTwo`
- `createdAt`
- `status` — `PENDING` or `ANSWERED`

**Answer**
- `id`
- `questionId` — unique relationship to the question
- `selectedOption`
- `submittedAt`

A question must have no more than one associated answer. Enforce this with a database-level unique constraint on `questionId` and an atomic server-side submission operation or transaction.

Use the database as the source of truth for answer status.

### Sender Access and Privacy

- Generate a separate, unguessable results-access token for the sender.
- Do not expose the sender's results-access token in the public question link.
- The public question link should permit answering only, not viewing the sender's private results page.
- Validate all submissions on the server.
- Do not trust question IDs, answer status, or submitted values supplied by the client without validation.
- Avoid exposing database credentials or secret tokens in client-side code.
- Do not collect unnecessary personal information from the receiver.

If authentication is not being used, explain that possession of the sender's private results link grants access to the results.

## 4. Suggested Pages

- `/` — Create a new question.
- `/answer/[questionId]` — Receiver views and answers the shared question.
- `/results/[resultsToken]` — Sender views the question's response and status.

Use the actual route conventions of the existing project if they differ.

## 5. UI and UX Expectations

Design the app to feel modern, friendly, lightweight, and easy to use.

- Centered cards with rounded corners and subtle shadows.
- Clear typography and spacing.
- Visually distinct answer options.
- Responsive layouts for phones, tablets, and desktops.
- Smooth but subtle animations.
- Copy-link feedback and clear submission confirmations.
- Friendly empty, loading, expired/invalid-link, already-answered, and error states.
- Accessible keyboard navigation and visible focus states.
- Avoid unnecessary steps and clutter.

Keep the original playful interaction, if it already exists, where the second answer button moves away when the cursor approaches it. Make sure the receiver can still select and submit an answer reliably, and do not let that animation interfere with the one-time submission rules.

## 6. Important Edge Cases

Handle these cases properly:

1. The receiver opens an invalid or nonexistent question link.
2. The receiver opens a question that has already been answered.
3. The receiver submits an answer and refreshes the page.
4. The sender opens the results page before an answer is submitted.
5. The sender opens the results page after the receiver has answered.
6. Two answer submissions reach the server simultaneously.
7. The user creates multiple questions.
8. The receiver opens the same question on another device or browser.
9. The network fails during submission.
10. The sender shares the public question link without accidentally sharing their private results link.

Never show a success message until the server confirms that the answer was saved successfully.

## 7. Acceptance Tests

Consider the feature complete only when all of these tests pass:

- A sender can create a question and copy its unique link.
- Another person can open the link on a different device.
- The receiver can select and submit one answer.
- The sender can view the submitted answer through the private results link.
- The receiver cannot submit another answer by refreshing or reopening the page.
- Two simultaneous submissions cannot create two answers.
- Creating a new question produces a separate link and does not affect previous results.
- The sender's private results link is not exposed through the public answering page.
- The app works correctly on mobile and desktop.
- Database and server validation enforce the rules even if someone bypasses the frontend.

## 8. Implementation Instructions

First, inspect the existing project structure and identify the current question form, answer page, routes, components, and available backend/database setup.

Then implement this feature in the existing project rather than rebuilding everything unnecessarily.

Provide:
1. A brief explanation of the architecture and any new dependencies.
2. The complete code for every new or modified file.
3. Database schema and migration instructions.
4. Required environment variables, using placeholders for secrets.
5. Local setup and run instructions.
6. A practical testing checklist for sender and receiver flows.

Do not leave placeholder functions, fake database calls, or nonfunctional buttons. Make the feature work end to end.

**Priority:** Reliable question sharing, persistent answers across devices, true one-time submission, and secure sender-only results access. Visual polish comes after these core requirements are working.