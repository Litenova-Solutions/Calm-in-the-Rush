# Contributing

Read `AGENTS.md`, `litespec.project.json`, and the records in `docs/` before editing. Keep changes
within the application and documented repository files that the task names.

## Local checks

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm type-check
pnpm build
dotnet build apps/mobile/CalmInTheRush.Mobile.slnx
```

Use ASCII prose, visible focus states, screen-reader labels, and controls at least 44 by 44. Do not
add server persistence, authentication, analytics, or tracking.

## Pull requests

Describe the user-facing result and the evidence from the required checks. Complete the media-license
and AI-disclosure sections in the pull request template when they apply.
