---
{"kind":"decision","id":"architecture-constraints","specStatus":"approved","owner":"Engineering","lastReviewed":"2026-08-18"}
---

# Architecture constraints

These constraints moved from [the product brief](../product/brief.md) so package and storage decisions have one technical record.

- Use pnpm workspaces with the web demo in `apps/web` and shared repository configuration in `packages/`.
- Use Next.js for the sole web origin.
- Use the governed shadcn/ui and Tailwind CSS baseline for the web interface.
- Keep experience configuration, storage logic, and bundled experience definitions in `apps/web/lib/content`.
- Store bundled media under `apps/web/public/media`.
- Pin the toolchain listed in the repository root package manifest.

## Storage

This demo has one storage boundary: the browser. IndexedDB holds local experience configuration, visitor image uploads, visitor one-liners, and locally curated tile images under [the local content storage decision](local-content-storage.md). The bundled five-screen experience is the fallback when no local record exists.

Do not add an API route, server action, server database, remote content service, browser-to-browser sync, migration, or compatibility layer. A hosted bank remains deferred until the product owner asks for it.

An image or one-liner entered in the demo stays in the current browser until its associated record or local database is removed.

## Administration stays local

The administration route is public and not a security boundary because every change stays in the current browser. It does not publish content to other people. Authentication and an audit trail are future requirements only if the product owner asks for hosted content.
