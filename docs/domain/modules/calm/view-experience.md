---
{"kind":"use-case","id":"calm.view-experience","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-18","operationType":"query","actors":["person"],"entryPoints":["web-demo"],"risks":["availability"],"applicableExtensions":[]}
---

# View the experience

## Trigger

A person opens `/` or `/demo`.

## Rules

- Show the first pre-filled tile of the first cover-enabled Gallery screen as the opening Nature cover. Do not show a logo splash.
- On the opening cover, play the configured bundled video muted and looped when motion is allowed. When reduced motion is requested, show the poster still instead.
- On the opening cover, show the configured sentence at the upper left in larger non-bold, softly translucent text with low-amplitude motion. Play the matching ambient bed with sound on by default; browsers start audio at the first touch. Show a small sound control beside the sole forward action `See More` in the transparent bottom navigation bar. Do not show a page title or progress label over the image.
- Let the person move in order through Gallery, Breathing, and RUST gateway screens. Page navigation moves heading focus to the current screen title. Silent gallery grids, breathing, and gateway screens show no sound control. The sound choice persists across screens.
- Let the person open any tile with media as a full active view with its sentence and its matching sounds. An active video view shows the sound control beside `See More` in the same bottom bar. An active photo view shows only `See More`. `Back` and `Next` stay exclusive to the gallery grid. Close the view with `See More` or the Escape key. Only one bed ever plays; the grid itself stays silent. Do not show a page title over an active tile view.
- Gallery screens render one calm lowercase heading in a small frosted badge centered at the top of borderless, gap-free tiles in a two-column grid that fills the full screen area. The badge uses the same quiet extra-small style as the bottom navigation, with a translucent background and soft blur for readability. Video tiles play muted and looped when motion is allowed and carry a small edge-aligned credit with the author and a link to the license. Nature hides its opening cover by default and uses a labelled `See More` action to enter its grid. An empty upload tile shows its configured label and guidance sentence.
- Render Take a Breath with its lowercase title, short description, and repeating slow yellow-orange orb moving across a blue sine wave. Do not show playback controls, phase labels, timers, or links. When reduced motion is requested, stop automatic movement.
- Center the last two gateway screens vertically. Show the supplied logo and its calm lowercase title only on the logo gateway. The default logo gateway has no description and no links. Show no logo on the final quote gateway, only its calm lowercase quote title and the one-liner form. Render a description only when configured, and render external links only when configured.
- Show the optional browser-local one-liner prompt and large multi-line input only on the final gateway screen. Show a divider between links and the reflection section only when that screen has both.
- Use an accessible label for every action, visible focus states, and a recoverable alert for local storage or media failures.
