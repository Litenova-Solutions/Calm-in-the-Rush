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
pnpm content:check
pnpm build
pnpm verify
```

Do not add authentication, a server database, analytics, cookies, uploads to a server, or a remote
content service. Browser administration uses private IndexedDB storage. Preserve the untracked
`.fuse/` directory.
