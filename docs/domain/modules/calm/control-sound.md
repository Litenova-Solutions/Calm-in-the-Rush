---
{"kind":"use-case","id":"calm.control-sound","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-14","operationType":"command","actors":["person"],"entryPoints":["web-demo"],"risks":["availability"],"applicableExtensions":[]}
---

# Start scene sound

## Trigger

A person selects one of the four bundled scene posters in `/demo`.

## Rules

- The lead poster and picture gallery are silent.
- The selected bundled scene starts with its embedded ambient sound unmuted.
- A personal photo remains silent because it has no associated audio or video.
- There is no in-product mute preference or sound toggle in this early demo.
- The browser or device volume controls remain available to the person.
- If sound cannot start, the surface keeps the selected still poster and reports a recovery message.
