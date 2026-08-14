---
{"kind":"decision","id":"local-content-storage","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-14"}
---

# Keep administration content in the browser

## Decision

Use IndexedDB database `calm-in-the-rush-local-v2` with `catalog`, `media`, and `sentences` stores.
The catalog holds scene metadata, the media store holds locally curated video and poster blobs, and the
sentences store holds the English sentence bank. The demo reads these records when present and otherwise
uses the bundled seed catalog and default sentences.

The previous local database is not read. This early demo intentionally starts a new database instead
of adding a migration or compatibility layer.

A personal photo chosen in `/demo` is not an IndexedDB record. The browser keeps it only as an object
URL while the demo is open, then releases it when the photo is replaced or the component unmounts.

This is a same-browser demo boundary, not a publishing system. No blob, photo, sentence, or metadata is
sent to a server. The demo has no cross-tab synchronization, revision state, migration, or compatibility
layer. Reset removes the database.

## Constraint

Storage eviction, private mode, cleared site data, and a future local format reset can remove local
scenes and added sentences. The administration page displays used media storage, estimated quota, and a
reset action.
