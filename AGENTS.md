# Calm in the Rush agent guide

Read `standards/AGENTS.md` before changing repository structure, frontend code, documentation, or CI.
The standards submodule is pinned to Engineering Standards v1.9.0. This project uses the local
`frontend-demo` profile in `standards.project.json`; it has no API, database, or server process.

Canonical product requirements live in `docs/product/brief.md`. Domain and page specifications are
under `docs/domain/` and `docs/ui/`. Decisions in `docs/decisions/` record intentional overrides.
Read `C:\Users\a.shafie\.config\writing-rules.md` before editing prose. Keep prose ASCII and run
the validation scripts before delivery.

Useful commands:

```bash
pnpm install --frozen-lockfile
pnpm dev:web
pnpm format:check
pnpm lint
pnpm type-check
pnpm docs:check
pnpm build
pnpm verify
```

Do not add authentication, a server database, analytics, cookies, uploads to a server, or a remote
content service. Browser administration uses private IndexedDB storage. Preserve the untracked
`.fuse/` directory.

## Visitor visual hierarchy

- Active-image screens make the image primary. Do not show a page title, progress label, persistent utility, or more than one low-prominence action over an active image.
- An assigned sentence on active media stays calm, non-bold, and edge-aligned. A slow low-amplitude motion cue is permitted when it respects reduced-motion preferences. Do not turn the sentence into a headline.
- Gallery screens use borderless, gap-free two-column image grids. Do not add card chrome, captions, metadata, or surrounding copy unless an explicit product requirement needs it.
- An empty upload tile is an explicit exception to the gallery text rule. Show its configured prompt so people know which photo to add.
- Put personal reflection controls at an intentional endpoint, never as a persistent control over active media.
- A calming motion screen shows only its necessary title, short description, and visual cue. Do not add playback controls, phase labels, timers, or external links without an explicit product decision.
