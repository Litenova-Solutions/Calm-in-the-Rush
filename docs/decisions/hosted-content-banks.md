---
{"kind":"decision","id":"hosted-content-banks","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-18"}
---

# Defer hosted content banks

## Decision

Do not build a backend for this web demo. Experience screens, pre-filled local images, visitor image uploads, and one-liners remain in the current browser's IndexedDB. The five bundled screens remain the fallback content.

There is no API, server action, server database, cloud bucket, authentication, remote upload, cross-tab synchronization, migration, or compatibility layer. The local administration route does not publish content to other people. Images and one-liners never reach a server.

## Revisit trigger

Revisit this decision only when the product owner explicitly asks for hosted content. That later decision must cover the public catalog, image storage, administration authentication, audit history, deletion, privacy, and uploaded media storage. None of that work is part of this demo.
