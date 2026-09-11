---
{"kind":"page","id":"web.demo","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-18","app":"web","route":"/demo","useCases":["calm.view-experience","calm.add-photo","calm.save-one-liner"]}
---

# Demo page

Render the same live experience at `/` and `/demo`. On compact viewports the experience fills the screen without a frame. On wide viewports it sits inside a visible phone frame. The visitor begins with the wheat field cover, selects `See More`, then moves through Nature, Quiet Moments, Relaxed Faces, Take a Breath, the logo gateway, and the quote gateway in order. Nature holds four bundled videos with matching sounds and one visible upload tile. Each gallery uses two columns with one calm lowercase heading. Image uploads remain in the current browser.

The opening cover presents a larger, softly translucent, non-bold assigned sentence at the upper left with a low-amplitude motion cue. Its transparent bottom navigation bar contains only `See More`. The galleries show one calm lowercase heading in a small frosted badge centered at the top, in the same quiet extra-small style as the bottom navigation, and no caption, card, or gap between pictures, and their tiles fill the full screen area. Empty upload tiles retain their configured guidance. Take a Breath has only its lowercase title, short description, and a glowing yellow-orange orb moving across a blue sine wave, which stops when the person requests reduced motion. The logo gateway shows only the logo and its lowercase title. The final quote gateway shows the browser-local multi-line one-liner input with no links. The route has no share control, splash logo, administration link, or sentence bank.

## UI Contract

The machine-readable contract for this route is [`demo.ui.json`](demo.ui.json), validated by `standards/schemas/ui-page.schema.json`. It declares the shell, regions, states, direct-navigation behavior, responsive composition, accessibility expectations, and evidence IDs.

The construction language it draws from is [the web UI vocabulary](web/vocabulary.json).
