---
{"kind":"use-case","id":"calm.share-moment","specStatus":"approved","implementationStatus":"planned","owner":"Product and engineering","lastReviewed":"2026-08-07","operationType":"command","actors":["person"],"entryPoints":["web-demo","native-app"],"risks":["availability"],"applicableExtensions":[]}
---

# Share a moment

## Trigger

A person presses Share in the dock.

## Rules

- Use native sharing on Expo.
- Use Web Share in browsers that expose it.
- Copy the canonical URL when Web Share is not available.
- Report a recoverable failure without leaving the scene.

## Evidence

`[AC-SHARE-001]` checks Web Share, clipboard fallback, and the native adapter contract.
