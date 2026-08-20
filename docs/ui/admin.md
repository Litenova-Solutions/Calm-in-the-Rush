---
{"kind":"page","id":"web.admin","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-18","app":"web","route":"/admin","useCases":["content.manage-local-experience"]}
---

# Administration page

Show the local-only banner, a section switcher, ordered screen and tile editor, one-liner settings, local-data estimate, reset action, and recoverable messages. A screen is a Gallery, Breathing, or RUST gateway screen. A gallery tile is either pre-filled or a visitor upload. It accepts still JPEG, PNG, WebP, and AVIF images only. The screen editor keeps screen names, screen actions, ordered tile rows, tile actions, and add actions together. Forms open only from the relevant screen or tile.

The administrator assigns a sentence to every tile. This keeps a specific sentence associated with each image when a tile is made the starting cover, without exposing a visitor sentence picker. The administrator can make the first pre-filled gallery tile the starting cover, then choose whether it is repeated in that gallery grid. The page confirms removal or reset in a dialog.

The route has no sign-in and no server write path. It edits only the IndexedDB experience in the current browser. Mark the route no-index.

## UI Contract

The machine-readable contract for this route is [`admin.ui.json`](admin.ui.json), validated by `standards/schemas/ui-page.schema.json`. It declares the shell `admin-shell/default`, ordered regions, states, direct-navigation behavior, responsive composition, accessibility expectations, and evidence IDs.

The construction language it draws from is [the web UI vocabulary](web/vocabulary.json).
