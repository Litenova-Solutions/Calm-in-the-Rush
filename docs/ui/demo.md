---
{"kind":"page","id":"web.demo","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-14","app":"web","route":"/demo","useCases":["calm.view-scene","calm.choose-scene"]}
---

# Demo page

Render the same live gallery at `/` and `/demo` inside a visible phone frame. The supplied Rust in de Reuring logo briefly appears as a visual splash inside the phone screen before its live media. The root has no header, logo, hero copy, footer, or visitor action group. A small, elevated Admin link sits outside the frame. The low-saturation warm yellow and sage palette extends from the phone screen to the surrounding demo canvas, while the visible phone casing uses the `device-shell` dark graphite token. The frame uses the compact viewport and stops at the `container-phone` token on wider screens.

The phone starts on its selected image or video and exposes gallery and share controls. The gallery has
three local pages. The first starts with four nature videos and one image. The second starts with five
activity images. The first two reveal one upload space at a time through their seeded 12 total tiles.
The third begins with one centered upload control and has six seeded upload spaces. Images and videos
remain in the current browser only. Visible tiles fill the full gallery surface behind compact
translucent close, title, count, and page-navigation controls; revealing another upload tile adds a row
and reduces their size. More than 12 visible tiles scroll within that surface. The header does not show
the page description. The matching glass header and page-navigation
surfaces use the same subtle edge and are more opaque over light content. The empty personal page uses
a muted surface so its floating bars and upload action remain distinct. Bottom actions put their
destination title before the directional icon. Gallery-page and selected-media changes use short motion unless reduced motion is requested.
Active media shows a light-weight sentence with adaptive difference blending. Gallery and
share controls fade after 3.5 seconds without interaction, then return when the person presses the
phone screen or reaches them with the keyboard. Selecting a video requests motion and sound playback.

## UI Contract

The machine-readable contract for this route is [`demo.ui.json`](demo.ui.json), validated by `standards/schemas/ui-page.schema.json`. It declares the shell, regions, applicable states, direct-navigation behavior, responsive composition, accessibility expectations, and evidence IDs.

The construction language it draws from is [the web UI vocabulary](web/vocabulary.json).
