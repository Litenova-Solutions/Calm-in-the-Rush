---
{"kind":"use-case","id":"calm.save-one-liner","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-18","operationType":"command","actors":["person"],"entryPoints":["web-demo"],"risks":["availability"],"applicableExtensions":[]}
---

# Save a calm one-liner

## Trigger

A person reaches the final RUST gateway page.

## Rules

- Ask the administrator-configured prompt, seeded as `What does calm mean to you, and/or how do you make time for it? Keep it short.`
- Allow a short optional answer of up to 160 characters.
- Store, edit, and clear the answer only in the current browser's IndexedDB.
- Report a recoverable message if the local write fails.
