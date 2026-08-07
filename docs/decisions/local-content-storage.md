---
{"kind":"decision","id":"local-content-storage","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-07"}
---

# Keep administration content in the browser

## Decision

Use IndexedDB database `calm-in-the-rush-demo` with `catalog`, `media`, and `settings` stores. A
catalog revision is sent through BroadcastChannel with a localStorage fallback. The demo reads the
local catalog when present and otherwise uses the bundled seed catalog.

This is a same-browser demo boundary, not a publishing system. No blob, metadata, or revision is
sent to a server. Reset removes the database and revision key.

## Constraint

Storage eviction, private mode, and cleared site data can remove local edits. The administration page
must display used storage, estimated quota, and a reset action.
