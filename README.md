# Mento

An AI-powered maintainer copilot. Mento fetches GitHub issues, generates plain-English summaries with urgency scores, and runs a triage pipeline that learns from past decisions to suggest P0–P4 priorities. The more issues you triage, the sharper its suggestions get.

Live demo: https://mainto-five.vercel.app

## How it works

1. Search a GitHub repository and pull its open issues.
2. Generate a structured summary per issue (2–3 sentence summary, urgency score 1–10, key points, suggested actions).
3. Run the triage agent to assign a priority (P0–P4), grounded in historical patterns and similar past decisions.
4. Override the agent's call when it is wrong. That feedback is recorded, grades the agent, and shapes future precedent.

Every fetched issue, summary, triage decision, and learned pattern is stored in Sanity as structured content, so the agent reads from its own memory before making the next decision.

## Tech stack

- **Next.js 16** (App Router)
- **Sanity** for structured content and agent memory (Studio mounted at `/studio`)
- **Vercel AI SDK** with 10+ interchangeable model providers
- **Tailwind CSS 4**
- **Vitest** for the triage regression suite

## Getting started

### Prerequisites

- Node.js 20+
- pnpm (`packageManager` is pinned in `package.json`)
- A Sanity project (project ID + dataset)
- An API key for at least one supported model provider

### Environment variables

Create a `.env.local` in the project root:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-09-20

# Server-side write token. Without it, the app still runs but nothing is
# persisted to Sanity (no memory, no learning).
NEXT_PUBLIC_SANITY_API_TOKEN=your_write_token

# Optional. Falls back to the key entered in the in-app Settings modal.
ANTHROPIC_API_KEY=your_anthropic_key
```

Model keys and an optional GitHub token can also be supplied at runtime through the in-app **Settings** modal (stored in `localStorage`). A GitHub token is only needed to raise the unauthenticated rate limit.

### Install and run

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 for the app and http://localhost:3000/studio for Sanity Studio.

### Scripts

```bash
pnpm dev         # start the dev server
pnpm build       # production build
pnpm start       # serve the production build
pnpm lint        # eslint
pnpm test        # run the vitest regression suite
pnpm test:watch  # vitest in watch mode
```

## Sanity data model

| Type             | Role                                                                 |
| ---------------- | ------------------------------------------------------------------- |
| `issue`          | A fetched GitHub issue plus its workflow status and agent priority. |
| `issueSummary`   | An AI-generated summary, urgency score, key points, and actions.    |
| `triagePattern`  | A learned pattern (keywords, labels, typical urgency/resolution).   |
| `triageDecision` | A recorded priority decision and its accuracy after human feedback. |

Issues use a stable document `_id` derived from `owner/repo/issueNumber` (see `lib/issue-document-id.ts`), so summarization and prioritization update the same document instead of creating duplicates. A newer summary never downgrades an issue that has already reached the `prioritized` stage.

## Triage pipeline

The pipeline moves issues through five stages: **New → Summarized → Prioritized → In Review → Resolved**.

Prioritization (`app/api/prioritize/route.ts`) works in three steps:

1. **Match.** `lib/triage/matching.ts` finds relevant historical patterns and similar past decisions.
2. **Prompt.** Matches are passed to the model as context alongside the issue.
3. **Persist.** The resulting `triageDecision` is written back to Sanity and reused as precedent.

### Guarding against silent drift

A pipeline that learns from past decisions can quietly learn a maintainer's bad call and keep repeating it while the output still looks correct. Several safeguards keep that in check:

- **Precise matching.** Similar-decision matching requires at least two significant word overlaps (stop words excluded) rather than a single shared token, and keyword matching respects word boundaries — so loose substring hits are not injected into the prompt as precedent.
- **Golden-set regression test.** `lib/triage/matching.test.ts` holds a curated set of real issues with locked expected priorities, including adversarial pairs — near-identical titles that should land on opposite ends of the scale. If the matchers stop discriminating on substance, the suite fails loudly.
- **Feedback loop.** A maintainer override is recorded via `app/api/triage-feedback/route.ts`, grades the agent (`agentAccuracy`), and any decision graded wrong is excluded from future precedent, so a bad day cannot keep teaching the model.

Run the suite with `pnpm test`.

## Project structure

```
app/
  api/
    issues/          # fetch GitHub issues
    summarize/       # generate issue summaries
    prioritize/      # assign P0–P4 with historical context
    triage-feedback/ # record maintainer overrides and grade the agent
  components/        # UI (issue cards, workflow pipeline, settings)
  hooks/             # useMaintainerCopilot state + actions
  studio/            # embedded Sanity Studio
lib/
  ai/                # provider registry + summarize helper
  triage/            # matching logic + golden-set test
  github.ts          # GitHub issues client
sanity/
  schemaTypes/       # issue, issueSummary, triagePattern, triageDecision
```

## Deploying

The app deploys cleanly to Vercel. Set the same environment variables in your Vercel project settings, then connect the repository and deploy.
