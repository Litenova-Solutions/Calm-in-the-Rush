---
{"kind":"page","id":"web.landing","specStatus":"approved","implementationStatus":"planned","owner":"Product and engineering","lastReviewed":"2026-08-07","app":"web","route":"/","useCases":["calm.view-scene"]}
---

# Landing page

Use a desktop header with the mark and the `Calm in the Rush` label beside it, a Requirements link,
GitHub link, and `Open the demo` button. On narrow screens keep the full brand and demo button in the
header, move the plan, privacy, source, and license links to the footer, and keep the footer compact.
The landing page contains only the header, hero, and footer. The hero uses a static lake poster.

## UI Contract

The machine-readable contract for this route is [`landing.ui.json`](landing.ui.json), validated by
`standards/schemas/ui-page.schema.json`. It declares the shell `public-shell/default`, the ordered regions,
the applicable states, initial scroll and focus, compact and wide composition, accessibility
expectations, and the evidence IDs.

The construction language it draws from is [the web UI vocabulary](web/vocabulary.json).

The landing route is the public entry point: header, hero, footer. It requests no media so the first view stays quiet.
