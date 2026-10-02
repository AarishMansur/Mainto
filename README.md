# Mento

An AI-powered maintainer copilot. Mento fetches GitHub issues, generates plain-English summaries with urgency scores, and runs a triage pipeline that learns from past decisions to suggest P0–P4 priorities. The more issues you triage, the sharper its suggestions get.

Live demo: https://mainto-five.vercel.app

## How it works

1. Search a GitHub repository and pull its open issues.
2. Generate a structured summary per issue (2–3 sentence summary, urgency score 1–10, key points, suggested actions).
3. Run the triage agent to assign a priority (P0–P4), grounded in historical patterns and similar past decisions.
4. Override the agent's call when it is wrong. That correction becomes the precedent for this repository. The model's original call stays on record as model output and is not what the next issue learns from.

Every fetched issue, summary, and triage decision is stored in Sanity. Learned precedent is the maintainer's priority, scoped to the repository it came from.

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

# Server-only write token. This is what persists issues and triage decisions.
# Do not prefix it with NEXT_PUBLIC_. A public write token is readable in the browser.
SANITY_API_WRITE_TOKEN=your_write_token

# Optional viewer token for draft preview. This is the only Sanity token the
# live client receives in the browser. Leave it unset for a public dataset.
SANITY_API_READ_TOKEN=your_read_token

# Optional. Falls back to the key entered in the in-app Settings modal.
ANTHROPIC_API_KEY=your_anthropic_key
```

Without `SANITY_API_WRITE_TOKEN` the app still triages, but nothing is stored. If you previously set `NEXT_PUBLIC_SANITY_API_TOKEN`, rename it to `SANITY_API_WRITE_TOKEN` and delete the public variable so the write token is not shipped to the browser.

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
| `triagePattern`  | A maintainer pattern for one repository (keywords, labels, typical urgency). |
| `triageDecision` | Repository state for one decision: model output, the human priority, and the precedent that future triage may learn from. |

A pattern or decision applies only inside the repository stored on that document. A pattern with no repository is ignored.

Issues use a stable document `_id` derived from `owner/repo/issueNumber` (see `lib/issue-document-id.ts`), so summarization and prioritization update the same document instead of creating duplicates. A newer summary never downgrades an issue that has already reached the `prioritized` stage.

## Triage pipeline

The pipeline moves issues through five stages: **New → Summarized → Prioritized → In Review → Resolved**.

Prioritization (`app/api/prioritize/route.ts`) keeps five kinds of data apart:

1. **Repository state.** Patterns and decisions are loaded only for the repository being triaged.
2. **Untrusted input.** GitHub issue title and body stay in the model prompt. They are not written into precedent, and they are not sent to the model at all when a maintainer precedent already matches.
3. **Human decisions.** Feedback stores the maintainer's priority and copies it to `precedentPriority`, whether or not it matches the agent.
4. **Learned precedent.** The next suggestion uses that maintainer priority. A corrected decision is the new precedent; it is not dropped.
5. **Model output.** `modelPriority` records what the model said. It becomes precedent only after a maintainer confirms or replaces it.

### Guarding against silent drift

A pipeline that learns from past decisions can quietly learn the wrong call and keep repeating it. Several safeguards keep that in check:

- **Human precedent wins.** If a similar maintainer decision exists in this repository, that priority is the suggestion. The model is not asked to re-decide it.
- **Corrections teach.** A wrong agent decision stays stored as model output, and the maintainer's priority is what the next issue learns.
- **Repository scope.** Decisions and patterns from one project do not match another.
- **Precise matching.** Similar-decision matching requires at least two significant word overlaps (stop words excluded), and the closest overlap wins. Keyword matching respects word boundaries.
- **Priority regression tests.** `lib/triage/precedent.test.ts` locks the golden priorities and checks that corrections, unconfirmed model output, cross-repository memory, and injected issue text cannot change them. `lib/triage/matching.test.ts` still checks that near-duplicate titles do not match.

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
