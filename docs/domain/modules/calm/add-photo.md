---
{"kind":"use-case","id":"calm.add-photo","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-18","operationType":"command","actors":["person"],"entryPoints":["web-demo"],"risks":["availability"],"applicableExtensions":[]}
---

# Add a local photograph

## Trigger

A person selects a visible upload tile in Nature, Quiet Moments, or Friendly Faces.

## Rules

- Accept only JPEG, PNG, WebP, and AVIF image files.
- Store an accepted image in the current browser's IndexedDB and use its file name as alternative text until local administration replaces that metadata.
- Show every configured upload tile. Completing one upload must not hide a second Friendly Faces upload option.
- Before an upload receives an image, show the administrator-configured label and guidance sentence inside that tile.
- Do not send the file to a server, a remote media service, or another browser.
- Report invalid, unreadable, quota, and write failures with a recoverable message.
