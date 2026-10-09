# Project: Playful Two-Choice Question Form

## Objective
Build a small, interactive web application using Next.js and React where a user can create a question with two answer choices. After submitting the form, the app displays the question and both options on a second screen. The first option should be clickable, while the second option playfully moves away whenever the user tries to hover over it, encouraging the user to select the first option.

## Tech Stack
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- React hooks (`useState`, `useRef`, as needed)
- CSS transitions or Framer Motion for animations (prefer CSS if sufficient)

**Important:** Do not use a database, backend, API routes, server actions, authentication, or external APIs. All data should remain in client-side React state. No persistence across page refreshes is required.

## Page 1: Create Your Question

Create a clean, responsive form with these fields:

1. **Question**
   - A required text input or textarea.
   - Example: "Do you like me?"

2. **First answer choice**
   - A required text input.
   - Example: "Yes"

3. **Second answer choice**
   - A required text input.
   - Example: "No"

4. **Create Question** button

### Form behavior
- Validate that all three fields contain non-empty values.
- Show clear validation messages if any field is empty.
- When the user submits a valid form, save the values in React state and navigate to the question display screen.
- Use client-side navigation with Next.js App Router.
- Do not save anything to a database or local storage.

## Page 2: Interactive Question Display

Display the question and two answer buttons using the values entered on the first page.

Example:

**Do you like me?**

[ Yes ]   [ No ]

### First answer behavior
- The first answer should behave like a normal button.
- When clicked, show a friendly success message such as:
  "You selected Yes! 😊"
- Replace the answer buttons with the result message or display the message below them.
- Prevent repeated selections after the user has selected the first answer.

### Second answer behavior
- The second answer should initially appear beside the first answer.
- When the mouse cursor moves over or approaches the second answer, it should smoothly move to another safe position within the question card or designated answer area.
- Use a playful animation with smooth transitions, such as `transform` transitions or Framer Motion.
- The button should move repeatedly whenever the user tries to hover over it.
- Prevent the second answer from being clicked by using pointer interaction logic, not by relying only on visual animation.
- Ensure that the moving button does not overlap the question text, the first button, or other important content.
- Keep the movement within the visible container and prevent horizontal/vertical overflow.
- Make the behavior feel playful rather than frustrating.

### Touch and accessibility behavior
- On touch devices, where hover does not exist, move the second button when the user attempts to tap it.
- Support keyboard navigation and screen readers where practical.
- Do not trap keyboard users or make the first option impossible to reach.
- Include an accessible label for the question and clear focus indicators.

## Design Requirements
- Modern, playful, friendly UI.
- Center the question card vertically and horizontally.
- Use a light background with a subtle gradient.
- Give the card rounded corners, a soft shadow, and comfortable spacing.
- Style the answer choices as prominent buttons with rounded corners.
- Use smooth animations and subtle hover effects.
- Add a small heading such as "A Little Question for You 💌".
- Make the layout responsive on mobile, tablet, and desktop.
- Include a "Create another question" or "Back" button to return to the form.

## Technical Requirements
- Use reusable React components where appropriate.
- Use controlled form inputs.
- Use TypeScript types for the question and answer data.
- Use React state to transfer the entered question and answers between screens without a backend.
- Ensure all browser-only interaction logic runs inside client components marked with `"use client"` where required.
- Clean up any event listeners if used.
- Avoid unnecessary dependencies.
- Ensure the application runs with `npm run dev` and has no TypeScript or lint errors.

## Suggested Component Structure
- `app/page.tsx` — Question creation form.
- `app/question/page.tsx` — Interactive question display.
- `components/QuestionForm.tsx` — Form fields and validation.
- `components/QuestionCard.tsx` — Question and answer display.
- `components/MovingAnswerButton.tsx` — Animation and pointer interaction for the second answer.

You may adjust the structure if necessary, but keep the implementation simple.

## Final Deliverables
1. Complete working Next.js project code.
2. All required components and styling.
3. Working form validation.
4. Working navigation between the two screens.
5. Smooth, repeated movement of the second answer.
6. A clear success message after selecting the first answer.
7. Brief instructions for installing dependencies and running the project locally.

Before finishing, test the full flow: create a question, submit it, view both choices, try hovering over and tapping the second choice, select the first choice, and return to create another question.