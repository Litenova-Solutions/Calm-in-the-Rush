---
{"kind":"use-case","id":"calm.share-moment","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-14","operationType":"command","actors":["person"],"entryPoints":["web-demo"],"risks":["availability"],"applicableExtensions":[]}
---

# Share a moment

## Trigger

A person presses Share while a bundled scene or personal photo is selected in `/demo`.

## Rules

- Use Web Share where the browser provides it.
- Copy the current `/demo` URL when Web Share is not available.
- A personal photo is never included in the shared data.
- Report a recoverable failure without leaving the selected picture.
