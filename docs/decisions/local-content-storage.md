---
{"kind":"decision","id":"local-content-storage","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-14"}
---

# Keep gallery content in the browser

## Decision

Use IndexedDB database `calm-in-the-rush-local-v3` with `gallery`, `galleryUploads`, and `media` stores. The gallery store holds ordered pages, tile definitions, and active-media sentences. The upload store maps an upload tile to its selected local media. The media store holds browser-local image and video blobs.

The browser falls back to the three bundled gallery pages when it has no v3 configuration. The former v2 database is not read. This early demo starts a new local format instead of adding a migration or compatibility layer.

A visitor image or video selected for an upload tile becomes a browser-local gallery record. It never reaches a server and is removed with the containing tile, page, or reset action.

This is a same-browser demo boundary, not a publishing system. No blob, image, video, or metadata is sent to a server. The demo has no cross-tab synchronization, revision state, migration, or compatibility layer. Reset removes the v3 database.

## Constraint

Storage eviction, private mode, cleared site data, and a future local format reset can remove local pages and media. The administration page displays used media storage, estimated quota, and a reset action.
