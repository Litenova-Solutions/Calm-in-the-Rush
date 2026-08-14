---
{"kind":"use-case","id":"calm.choose-scene","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-14","operationType":"command","actors":["person"],"entryPoints":["web-demo"],"risks":["availability"],"applicableExtensions":[]}
---

# Choose a scene

## Trigger

A person selects the lead poster in the `/demo` phone frame.

## Rules

- Reveal four published posters in a two-column grid and a fifth option to choose a personal photo.
- Do not show draft scenes.
- Each bundled poster control names the scene title, location, and creator for assistive technology.
- The fifth option accepts image files only and keeps the selected file in memory for the open demo
  session.
- Selecting a bundled poster replaces the grid with that scene and starts its embedded sound.
- Selecting a personal photo replaces the grid with the still image and starts no sound or video.
- Each selected bundled scene or personal photo chooses a random nature sentence from the current
  browser's sentence bank. When more than one sentence exists, it differs from the previous sentence.
- The gallery control returns to the picture grid and pauses selected scene media.
