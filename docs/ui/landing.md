---
{"kind":"page","id":"web.landing","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-18","app":"web","route":"/","useCases":["calm.view-experience","calm.add-photo","calm.save-one-liner"]}
---

# Root demo page

The root route renders the live phone-framed experience directly. It shares `/demo` implementation and opens on the Nature cover rather than a logo splash. The route has no public header, brand mark, introductory copy, action group, or footer. A small Admin link stays outside the frame. The surrounding canvas uses low-saturation warm yellow and sage, and the phone casing uses dark graphite.

## UI Contract

The machine-readable contract for this route is [`landing.ui.json`](landing.ui.json), validated by `standards/schemas/ui-page.schema.json`. It declares the shell, regions, states, direct-navigation behavior, responsive composition, accessibility expectations, and evidence IDs.

The construction language it draws from is [the web UI vocabulary](web/vocabulary.json).
