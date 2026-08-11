---
{"kind":"page","id":"web.admin","specStatus":"approved","implementationStatus":"planned","owner":"Product and engineering","lastReviewed":"2026-08-07","app":"web","route":"/admin","useCases":["content.manage-local-scenes"]}
---

# Administration page

Show the local-only banner, catalog rows, order controls, scene form, phone preview, storage estimate,
reset action, and recoverable messages. Mark the route no-index. Do not add a server write path.

## UI Contract

The machine-readable contract for this route is [`admin.ui.json`](admin.ui.json), validated by
`standards/schemas/ui-page.schema.json`. It declares the shell `admin-shell/default`, the ordered regions,
the applicable states, initial scroll and focus, compact and wide composition, accessibility
expectations, and the evidence IDs.

The construction language it draws from is [the web UI vocabulary](web/vocabulary.json).

The admin route uses the named secondary administration shell. Destructive actions confirm in a dialog rather than a native browser prompt.
