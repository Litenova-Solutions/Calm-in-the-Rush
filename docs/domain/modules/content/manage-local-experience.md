---
{"kind":"use-case","id":"content.manage-local-experience","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-18","operationType":"command","actors":["person"],"entryPoints":["web-admin"],"risks":["irreversible","availability"],"applicableExtensions":[]}
---

# Manage local experience content

## Trigger

A person opens `/admin` in a browser.

## Rules

- The route has no authentication because it is not a security boundary. Every change stays in the current browser.
- An administrator can add, edit, duplicate, remove, and reorder Gallery, Breathing, and RUST gateway screens. The configuration may contain zero screens.
- Gallery screens support a first pre-filled opening cover, an option to repeat that cover in the grid, and ordered pre-filled or visitor-upload image tiles.
- An administrator assigns each tile its own sentence. Pre-filled tiles require a title, alternative text, sentence, and supported image media. Upload tiles require a visible label and sentence.
- An administrator can edit the title and description for a fixed slow breathing cue.
- An administrator can edit the one-liner prompt and placeholder shown on the final RUST page, inspect local storage, and reset local data after confirmation.
- Reset removes v4 and known v3 local data, then restores the bundled five-screen configuration.
- There is no server write path, remote upload, cross-tab synchronization, migration, or compatibility layer.
