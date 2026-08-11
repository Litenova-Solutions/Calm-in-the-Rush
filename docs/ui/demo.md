---
{"kind":"page","id":"web.demo","specStatus":"approved","implementationStatus":"planned","owner":"Product and engineering","lastReviewed":"2026-08-07","app":"web","route":"/demo","useCases":["calm.view-scene","calm.choose-scene","calm.control-sound","calm.share-moment"]}
---

# Demo page

Use the shared experience component with the browser media and share adapters. Center a 9 by 19.5
surface on wide screens and let it fill a phone viewport. Keep the dock inside the surface at 320 by
568 and show a poster when motion is reduced.

## UI Contract

The machine-readable contract for this route is [`demo.ui.json`](demo.ui.json), validated by
`standards/schemas/ui-page.schema.json`. It declares the shell `stage-shell/default`, the ordered regions,
the applicable states, initial scroll and focus, compact and wide composition, accessibility
expectations, and the evidence IDs.

The construction language it draws from is [the web UI vocabulary](web/vocabulary.json).

The demo route is an immersive stage with a definite height, so the control dock stays inside the viewport at every supported size. The scene picker is a bottom sheet.
