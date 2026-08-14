---
{"kind":"page","id":"web.admin","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-14","app":"web","route":"/admin","useCases":["content.manage-local-scenes"]}
---

# Administration page

Show the local-only banner, a section switcher, one in-context page-and-tile gallery editor, sentence
list, local-data estimate, reset action, and recoverable messages. A tile is either pre-filled or
visitor upload. Pre-filled and uploaded media may be an image or video. The gallery editor puts page
names, ordered tile rows, page actions, and add actions in one tree. Add and edit forms open only from
the relevant page or tile, so they do not compete with the tree for attention. The gallery has no
fixed page or tile count beyond retaining at least one page. Moving an upload tile keeps its local
uploaded media. The page confirms removal or reset in a dialog.

The route has no sign-in and no server write path. It edits only the IndexedDB gallery in the current browser. Mark the route no-index.

## UI Contract

The machine-readable contract for this route is [`admin.ui.json`](admin.ui.json), validated by `standards/schemas/ui-page.schema.json`. It declares the shell `admin-shell/default`, ordered regions, applicable states, direct-navigation behavior, responsive composition, accessibility expectations, and evidence IDs.

The construction language it draws from is [the web UI vocabulary](web/vocabulary.json).
