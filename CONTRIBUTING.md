# Contributing

Read `AGENTS.md`, `standards/AGENTS.md`, the product brief, and the relevant domain or page
specification before editing. Keep changes within the web demo or documented repository files that
the task names.

## Local checks

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm type-check
pnpm docs:check
pnpm build
```

Use ASCII prose, visible focus states, screen-reader labels, and controls at least 44 by 44. Do not
add server persistence, authentication, analytics, or tracking.

## Pull requests

Describe the user-facing result and the evidence from the required checks. Complete the media-license
and AI-disclosure sections in the pull request template when they apply.
