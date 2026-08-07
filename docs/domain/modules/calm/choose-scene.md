---
{"kind":"use-case","id":"calm.choose-scene","specStatus":"approved","implementationStatus":"planned","owner":"Product and engineering","lastReviewed":"2026-08-07","operationType":"command","actors":["person"],"entryPoints":["web-demo","native-app"],"risks":["availability"],"applicableExtensions":[]}
---

# Choose a scene

## Trigger

A person opens the scene picker from the bottom dock.

## Rules

- Show published scenes with poster, title, location, credit, and selected state.
- Draft scenes never appear in the picker.
- Escape closes the picker and returns focus to the scene button.
- Changing scenes preserves the sound preference.
- Load the selected video and one transition target only.

## Evidence

`[AC-CHOOSE-001]` checks keyboard selection and focus return. `[AC-CHOOSE-002]` checks scene media and
attribution updates without horizontal overflow.
