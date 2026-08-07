---
{"kind":"use-case","id":"calm.control-sound","specStatus":"approved","implementationStatus":"planned","owner":"Product and engineering","lastReviewed":"2026-08-07","operationType":"command","actors":["person"],"entryPoints":["web-demo","native-app"],"risks":["availability"],"applicableExtensions":[]}
---

# Control sound

## Trigger

A person presses the sound control.

## Rules

- Initial sound is muted.
- The first press enables embedded audio after a user gesture.
- The preference remains while the page is open and when the scene changes.
- The control has a label that reports the current state.

## Evidence

`[AC-SOUND-001]` checks the initial muted state, user activation, state label, and scene-change behavior.
