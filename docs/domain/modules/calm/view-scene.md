---
{"kind":"use-case","id":"calm.view-scene","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-14","operationType":"query","actors":["person"],"entryPoints":["web-demo"],"risks":["availability"],"applicableExtensions":[]}
---

# View a scene

## Trigger

A person opens `/demo`.

## Rules

- Show the first published local or bundled scene as a still lead poster inside the phone frame.
- Do not request video for the lead poster or the picture gallery.
- Selecting the lead poster reveals four published scene posters and one personal-photo option.
- Selecting a bundled poster loops its video with embedded ambient sound. The selection is required
  before sound starts.
- Selecting a personal photo keeps that image still and does not request, generate, or upload video.
- Use the selected scene poster if video loading fails. When reduced motion is active, keep the
  poster still and play selected ambient sound without video motion.
- Pause selected media while the page is hidden, then resume it when the page becomes visible.
- Keep controls labelled for keyboard and screen-reader use.
