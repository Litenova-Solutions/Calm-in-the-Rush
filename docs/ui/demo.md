---
{"kind":"page","id":"web.demo","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-14","app":"web","route":"/demo","useCases":["calm.view-scene","calm.choose-scene","calm.control-sound","calm.share-moment"]}
---

# Demo page

Render the live experience on `/demo` inside a visible phone frame. The frame uses the available
viewport on a phone and stops at the `container-phone` token on wider screens. The landing route stays
static and links here. The first poster reveals four bundled scene tiles and one fifth tile for a
personal image. The personal image remains still and is held only for the open browser session.

Selecting a bundled scene starts its video and embedded ambient sound. Selecting either kind of picture
chooses a random nature sentence from the browser-local sentence bank. The grid hides the previous
sentence, then the selected picture's sentence fades in with a small upward movement when reduced
motion is not requested. The demo has no visitor video upload, generated motion, server upload, or
remote content service.

## UI Contract

The machine-readable contract for this route is [`demo.ui.json`](demo.ui.json), validated by
`standards/schemas/ui-page.schema.json`. It declares the shell, ordered regions, applicable states,
initial scroll and focus, compact and wide composition, accessibility expectations, and evidence IDs.

The construction language it draws from is [the web UI vocabulary](web/vocabulary.json).

The demo route uses the stage shell and has a fixed viewport height. The phone frame makes the route's
purpose visible without moving the running experience back into the landing page.
