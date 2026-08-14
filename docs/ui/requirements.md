---
{"kind":"page","id":"web.requirements","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-14","app":"web","route":"/requirements","useCases":["calm.view-scene"]}
---

# Requirements page

Read `docs/product/brief.md` during the Next.js build. Parse its JSON metadata block with a project
parser, render Markdown with `react-markdown` and `remark-gfm`, and do not allow raw HTML. Link to the
source file on GitHub.

## UI Contract

The machine-readable contract for this route is [`requirements.ui.json`](requirements.ui.json), validated by
`standards/schemas/ui-page.schema.json`. It declares the shell `public-shell/default`, the ordered regions,
the applicable states, initial scroll and focus, compact and wide composition, accessibility
expectations, and the evidence IDs.

The construction language it draws from is [the web UI vocabulary](web/vocabulary.json).

The requirements route renders the canonical product brief inside one content card. Tables and code blocks are named, keyboard-reachable scroll regions.
