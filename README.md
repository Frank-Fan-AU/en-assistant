# EN Assistant

Dual-pane writing assistant built with Next.js App Router. The left editor hosts multiple polishing agents (email, commit, diary, stand-up) while the right panel returns the OpenAI-generated rewrite with one-click copy. A privacy mask hides the original draft after three seconds of inactivity so Chinese content stays off your office screen.

## Prerequisites

- Node.js 18+
- An OpenAI API key with access to `gpt-4o-mini` (or any compatible Chat Completion model)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-your-key
   # Optional override (defaults to gpt-4o-mini):
   OPENAI_MODEL=gpt-4o-mini
   ```
3. Start developing:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000`, pick an agent tab, type your raw notes, and press **Run …** to generate the polished output.

## Available Scripts

- `npm run dev` – start the Next.js dev server
- `npm run lint` – run ESLint
- `npm run build` / `npm run start` – production build & serve

## Architecture

- `src/lib/agents.ts` centralizes agent metadata (id, prompt, placeholder) so the UI and API read from the same list.
- `src/app/page.tsx` renders the UI, handles the privacy mask timer, calls the `/api/agents` endpoint, and manages clipboard feedback.
- `src/app/api/agents/route.ts` validates the payload and forwards agent-specific prompts to OpenAI via the official SDK.

Customize `src/lib/agents.ts` to add or tweak agents, and set `OPENAI_MODEL` if you want to experiment with other GPT families.
