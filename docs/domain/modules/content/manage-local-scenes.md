---
{"kind":"use-case","id":"content.manage-local-scenes","specStatus":"approved","implementationStatus":"planned","owner":"Product and engineering","lastReviewed":"2026-08-07","operationType":"command","actors":["person"],"entryPoints":["web-admin"],"risks":["irreversible","availability"],"applicableExtensions":[]}
---

# Manage local scenes

## Trigger

A person opens `/admin` in a browser.

## Rules

- The route has no authentication and is not a security boundary.
- A scene is created from a title and one MP4 file. There is no other input.
- The cover is the first frame of the uploaded video. It is derived, never uploaded separately.
- The MP4 must be between 5 and 120 seconds and no larger than 50 MB. The file is validated when it is
  chosen, before any write.
- A locally uploaded scene records local provenance and a creator-owned license. It has no source URL
  because there is no third-party source to cite.
- First edit clones the complete seed catalog to IndexedDB.
- New blobs are stored before scene metadata is committed.
- A catalog must retain one published scene.
- Invalid media, quota errors, and write failures provide recovery text.
- Reset deletes the local database and revision key, then returns to bundled scenes.

## Evidence

`[AC-LOCAL-001]` checks schema and media validation. `[AC-LOCAL-002]` checks draft, publish, reorder,
replacement, and deletion behavior. `[AC-LOCAL-003]` checks reset and failed-write recovery.
