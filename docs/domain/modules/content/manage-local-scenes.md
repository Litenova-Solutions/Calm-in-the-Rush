---
{"kind":"use-case","id":"content.manage-local-scenes","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-14","operationType":"command","actors":["person"],"entryPoints":["web-admin"],"risks":["irreversible","availability"],"applicableExtensions":[]}
---

# Manage local scenes

## Trigger

A person opens `/admin` in a browser.

## Rules

- The route has no authentication and is not a security boundary.
- A locally curated scene is created from a title and one MP4 file. The cover is derived from the
  first video frame.
- The MP4 must be between 5 and 120 seconds and no larger than 50 MB. Validate the file before
  writing it.
- The admin lists the nature sentence bank and adds a sentence between 1 and 160 characters.
- Local media, scene metadata, and added sentences stay in the current browser's IndexedDB.
- Draft scenes stay out of the phone frame. `Show in experience` changes only the current browser's
  catalog.
- A catalog retains at least one shown scene.
- Invalid media, quota errors, sentence validation failures, and write failures provide recovery text.
- Reset deletes the local database and restores the bundled four-scene catalog and default sentences.
- There is no migration, compatibility layer, or cross-tab synchronization.
