---
{"kind":"decision","id":"architecture-constraints","specStatus":"approved","owner":"Engineering","lastReviewed":"2026-08-14"}
---

# Architecture constraints

These constraints used to sit in [the product brief](../product/brief.md). They moved here so the brief stays readable by everyone who needs to agree to it, and so changing a package boundary does not mean editing a product document.

- Use pnpm workspaces with deployables in `apps/` and shared packages in `packages/`.
- Use Next.js for the web origin and Expo Router for native routes.
- Use React Native Paper components with the governed theme and project-owned wrappers in `@calm/ui`.
- Keep the bank schema and seed media in `@calm/content`.
- Keep state and presentation in `@calm/experience`.
- Resolve media through public package exports. Application code must not import package-internal paths.
- Pin the toolchain listed in the repository root package manifest.

## Storage

This early demo has one storage boundary: the browser. IndexedDB holds local scene metadata, locally
curated media, and added sentences under [the local content storage decision](local-content-storage.md).
The bundled seed catalog and default sentence bank remain the fallback when no local records exist.

Do not add an API route, server action, server database, remote content service, browser-to-browser
sync, migration, or compatibility layer. A hosted bank is deferred until the product owner asks for
it.

A photograph chosen in the demo never reaches a server or a third party. It stays still in browser
memory for the open session and is not written to the local catalog.

## Administration stays local

The administration route is public and not a security boundary because every change stays in the
current browser. It does not publish a bank to other people. Authentication and an audit trail are
future requirements only if the product owner asks for hosted banks.
