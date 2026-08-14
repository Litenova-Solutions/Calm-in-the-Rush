---
{"kind":"decision","id":"architecture-constraints","specStatus":"approved","owner":"Engineering","lastReviewed":"2026-08-14"}
---

# Architecture constraints

These constraints used to sit in [the product brief](../product/brief.md). They moved here so the brief stays readable by everyone who needs to agree to it, and so changing a package boundary does not mean editing a product document.

- Use pnpm workspaces with the web demo in `apps/web` and shared repository configuration in `packages/`.
- Use Next.js for the sole web origin.
- Use the governed shadcn/ui and Tailwind CSS baseline for the web interface.
- Keep gallery configuration, storage logic, and bundled gallery definitions in `apps/web/lib/content`.
- Store bundled media directly under `apps/web/public/media`.
- Pin the toolchain listed in the repository root package manifest.

## Storage

This early web demo has one storage boundary: the browser. IndexedDB holds local gallery configuration,
visitor uploads, and locally curated tile images under [the local content storage decision](local-content-storage.md).
The bundled three-page gallery remains the fallback when no local records exist.

Do not add an API route, server action, server database, remote content service, browser-to-browser
sync, migration, or compatibility layer. A hosted bank is deferred until the product owner asks for
it.

A photograph chosen in the demo never reaches a server or a third party. It stays in the current
browser's gallery until the associated tile, page, or local database is removed.

## Administration stays local

The administration route is public and not a security boundary because every change stays in the
current browser. It does not publish a bank to other people. Authentication and an audit trail are
future requirements only if the product owner asks for hosted banks.
