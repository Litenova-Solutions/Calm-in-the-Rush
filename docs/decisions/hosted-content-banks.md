---
{"kind":"decision","id":"hosted-content-banks","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-14"}
---

# Defer hosted content banks

## Decision

Do not build a backend for the early web demo. Gallery pages, pre-filled local image or video media, and visitor uploads remain in the current browser's IndexedDB. The three bundled gallery pages remain the fallback content.

There is no API, server action, server database, cloud bucket, authentication, remote upload, cross-tab synchronization, migration, or compatibility layer. The local administration route does not publish content to other people. Gallery media never reaches a server.

## Revisit trigger

Revisit this decision only when the product owner explicitly asks for hosted banks. That later decision must cover the public catalog, media storage, administration authentication, audit history, deletion, privacy, and the storage location for uploaded media. None of that work is part of the current demo.
