---
{"kind":"page","id":"web.evidence","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-18","app":"web","route":"/evidence","useCases":["calm.view-experience"]}
---

# Evidence page

Publish the reasoning behind the product: what the research supports about a screen of pictures and
the color, motion, and sound around them, what it supports about the still personal-photo choice,
what it does not support in either case, and the design rules that follow. Hand-author the content in
the page component using the shared prose treatments. Do not render it from Markdown, because the
reader-facing version is shorter and differently ordered than the canonical records.

There are two canonical records: [the interface evidence review](../research/calm-interface-evidence.md)
and [the photo presence evidence review](../research/photo-presence-evidence.md). The page links to
both and must not contradict either. When either record changes, review this route.

## Required content

- Open on the two questions the page answers, and say in the lead that both answers are narrower
  than the category usually claims.
- Cover the interface evidence before the photo-presence evidence. The interface governs every
  visitor; the personal-photo choice governs one optional demo path.
- Name every study, its year, and at least one exact figure. Do not write "research shows".
- Report the counter-evidence in the same voice as the supporting evidence: the uncanny valley
  effect size, the moderators that reverse the direction, and the null results for nature imagery
  on a screen and for short breaks on performance.
- State that color psychology by hue is unsupported and that saturation and brightness carry the
  effect, because that is the finding the interface palette rests on.
- Present the design rules as one numbered list covering the interface first and the photograph
  second. They are fixed rules, not options.
- Carry a section stating that the project makes no medical claim and is not treatment, and that it
  makes no attention or productivity claim either.
- Link to both canonical records, the privacy page, and the product brief.

## UI Contract

The machine-readable contract for this route is [`evidence.ui.json`](evidence.ui.json), validated by
`standards/schemas/ui-page.schema.json`. It declares the shell `public-shell/default`, the ordered regions,
the applicable states, initial scroll and focus, compact and wide composition, accessibility
expectations, and the evidence IDs.

The construction language it draws from is [the web UI vocabulary](web/vocabulary.json).

The evidence route is a reading route: header, one content card of prose, footer. It requests no media.
