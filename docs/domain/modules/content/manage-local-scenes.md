---
{"kind":"use-case","id":"content.manage-local-scenes","specStatus":"approved","implementationStatus":"planned","owner":"Product and engineering","lastReviewed":"2026-08-07","operationType":"command","actors":["person"],"entryPoints":["web-admin"],"risks":["irreversible","availability"],"applicableExtensions":[]}
---

# Manage local scenes

## Trigger

A person opens `/admin` in a browser.

## Rules

- The route has no authentication and is not a security boundary.
- First edit clones the complete seed catalog to IndexedDB.
- New blobs are stored before scene metadata is committed.
- A catalog must retain one published scene.
- Invalid media, quota errors, and write failures provide recovery text.
- Reset deletes the local database and revision key, then returns to bundled scenes.

## Evidence

`[AC-LOCAL-001]` checks schema and media validation. `[AC-LOCAL-002]` checks draft, publish, reorder,
replacement, and deletion behavior. `[AC-LOCAL-003]` checks reset and failed-write recovery.
