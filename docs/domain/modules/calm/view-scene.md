---
{"kind":"use-case","id":"calm.view-scene","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-14","operationType":"query","actors":["person"],"entryPoints":["web-demo"],"risks":["availability"],"applicableExtensions":[]}
---

# View gallery

## Trigger

A person opens `/` or `/demo`.

## Rules

- Show the selected bundled or browser-local image or video inside a visible phone frame.
- The supplied logo splash appears only inside the phone screen, then the selected media appears. The
  root route renders no public header, wordmark, hero, footer, or visitor actions. The only control
  outside the frame is the Admin link.
- Use the low-saturation warm yellow and sage interface palette inside and outside the visible phone
  frame. The phone casing uses a dark graphite finish distinct from the sage media stage.
- The frame fills the compact viewport and stops at the desktop phone-width cap.
- A selected video loops with motion. A selection action may request sound playback; if the browser
  refuses it, report a recoverable message.
- The translucent gallery and share controls fade after 3.5 seconds without interaction when media is
  active. A pointer press inside the phone shows them again, and keyboard focus keeps them visible.
- Keep the gallery icon, share control, and selected media keyboard-accessible and labelled for
  assistive technology. The active-media sentence uses difference blending to remain legible over
  light and dark media, with a text shadow fallback.
- If local media cannot load, keep the phone usable and report a recoverable message.
