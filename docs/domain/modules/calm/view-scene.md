---
{"kind":"use-case","id":"calm.view-scene","specStatus":"approved","implementationStatus":"planned","owner":"Product and engineering","lastReviewed":"2026-08-07","operationType":"query","actors":["person"],"entryPoints":["web-demo","native-app"],"risks":["availability"],"applicableExtensions":[]}
---

# View a scene

## Trigger

A person opens `/demo` or the native application.

## Rules

- Select the first published scene by sort order, then title.
- Start video muted and loop it when media is available.
- Use the poster when reduced motion is active or video loading fails.
- Pause media while the page is hidden.
- Keep a heading and control dock reachable by keyboard and screen reader.

## Evidence

`[AC-VIEW-001]` checks muted start and the six-second idle state. `[AC-VIEW-002]` checks poster fallback,
visibility pause, and reduced-motion behavior.
