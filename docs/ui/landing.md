---
{"kind":"page","id":"web.landing","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-14","app":"web","route":"/","useCases":["calm.view-scene","calm.choose-scene"]}
---

# Root demo page

The root route renders the live phone-framed gallery directly. It shares the `/demo` implementation and begins with a brief supplied-logo splash inside the phone screen. It otherwise does not show a landing header, brand mark, introductory copy, action group, or footer. The only control outside the frame is the small, elevated Admin link. A low-saturation warm yellow and sage palette covers the gallery application and its surrounding demo canvas. The phone casing itself uses a dark graphite finish.

## UI Contract

The machine-readable contract for this route is [`landing.ui.json`](landing.ui.json), validated by `standards/schemas/ui-page.schema.json`. It declares the shell, regions, applicable states, direct-navigation behavior, responsive composition, accessibility expectations, and evidence IDs.

The construction language it draws from is [the web UI vocabulary](web/vocabulary.json).
