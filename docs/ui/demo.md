---
{"kind":"page","id":"web.demo","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-18","app":"web","route":"/demo","useCases":["calm.view-experience","calm.add-photo","calm.save-one-liner"]}
---

# Demo page

Render the same live experience at `/` and `/demo` inside a visible phone frame. The visitor begins with the first Nature tile as its cover, selects `See More`, then moves through Nature, Quiet Moments, Friendly Faces, Take a Breath, and the RUST gateway in order. Each gallery uses two columns. The first two have three bundled photographs and one visible upload tile. Friendly Faces has two independent visible upload tiles. Image uploads remain in the current browser.

The opening cover presents a larger, softly translucent, non-bold assigned sentence at the upper left with a low-amplitude motion cue. Its transparent bottom navigation bar contains only `See More`. The galleries have no visible title, caption, card, or gap between pictures, and their tiles fill the available screen area. Empty upload tiles retain their configured guidance. Take a Breath has only a title, short description, and a glowing yellow-orange orb moving across a blue sine wave, which stops when the person requests reduced motion. The final RUST page separates its browser-local multi-line one-liner input from the RUST links with a divider. The route has no share control, splash logo, video player, or sentence bank.

## UI Contract

The machine-readable contract for this route is [`demo.ui.json`](demo.ui.json), validated by `standards/schemas/ui-page.schema.json`. It declares the shell, regions, states, direct-navigation behavior, responsive composition, accessibility expectations, and evidence IDs.

The construction language it draws from is [the web UI vocabulary](web/vocabulary.json).
