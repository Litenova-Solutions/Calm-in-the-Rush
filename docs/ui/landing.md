---
{"kind":"page","id":"web.landing","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-14","app":"web","route":"/","useCases":["calm.view-scene"]}
---

# Landing page

Use a desktop header with the mark and `Calm in the Rush` label, a Requirements link, a GitHub link,
and an `Open the demo` button. On narrow screens keep the full brand and demo button in the header,
move the plan, privacy, source, and license links to the footer, and keep the footer compact.

The landing page contains the header, hero, static phone preview, and footer. The preview uses the
current lake image, sentence, and photograph credit. It requests no demo media. The primary action
opens `/demo`, where the live phone-framed experience runs.

## UI Contract

The machine-readable contract for this route is [`landing.ui.json`](landing.ui.json), validated by
`standards/schemas/ui-page.schema.json`. It declares the shell, ordered regions, states, initial scroll
and focus, compact and wide composition, accessibility expectations, and evidence IDs.

The construction language it draws from is [the web UI vocabulary](web/vocabulary.json).

The landing route is the public entry point. It has a dedicated demo route and no remote content
service.
