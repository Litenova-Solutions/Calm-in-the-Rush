---
{"kind":"decision","id":"hosted-content-banks","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-14"}
---

# Defer hosted content banks

## Decision

Do not build a backend for the early demo. Scene metadata, locally curated media, and added sentences
remain in the current browser's IndexedDB, and the four bundled nature scenes and default sentences
remain the fallback content.

There is no API, server action, server database, cloud bucket, authentication, remote upload, cross-tab
synchronization, migration, or compatibility layer. The local administration route does not publish
content to other people. A personal photo in the demo stays in browser memory and never reaches a
server.

## Revisit trigger

Revisit this decision only when the product owner explicitly asks for hosted banks. That later decision must cover the public catalog, media storage, administration authentication, audit history, deletion, privacy, and the storage location for any personal uploads. None of that work is part of the current demo.
