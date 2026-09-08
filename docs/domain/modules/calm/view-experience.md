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
- Let the person move in order through Gallery, Breathing, and RUST gateway screens. Page navigation moves heading focus to the current screen title. The sound control stays beside the page indicator on gallery screens and the choice persists across screens.
- Let the person open any tile with media as a full active view with its sentence and its matching sounds. The active view uses the same bottom bar with the sound control and `See More`. `Back` and `Next` stay exclusive to the gallery grid. Close the view with `See More` or the Escape key. Only one bed ever plays; the grid itself stays silent.
- Gallery screens render borderless, gap-free tiles in a two-column grid that fills the available screen area. Video tiles play muted and looped when motion is allowed and carry a small edge-aligned credit with the author and a link to the license. Nature hides its opening cover by default and uses a labelled `See More` action to enter its grid. An empty upload tile shows its configured label and guidance sentence.
- Render Take a Breath with its title, short description, and repeating slow yellow-orange orb moving across a blue sine wave. Do not show playback controls, phase labels, timers, or links. When reduced motion is requested, stop automatic movement.
- Show the optional browser-local one-liner prompt and large multi-line input only on the final RUST gateway screen, with a divider between the RUST links and the reflection section.
- Use an accessible label for every action, visible focus states, and a recoverable alert for local storage or media failures.
