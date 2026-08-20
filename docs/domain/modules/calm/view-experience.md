---
{"kind":"use-case","id":"calm.view-experience","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-18","operationType":"query","actors":["person"],"entryPoints":["web-demo"],"risks":["availability"],"applicableExtensions":[]}
---

# View the experience

## Trigger

A person opens `/` or `/demo`.

## Rules

- Show the first pre-filled tile of the first cover-enabled Gallery screen as the opening Nature cover. Do not show a logo splash.
- Let the person move in order through Gallery, Breathing, and RUST gateway screens. Page navigation moves heading focus to the current screen title.
- Gallery screens render borderless, gap-free tiles in a two-column grid that fills the available screen area. Nature hides its opening cover by default and uses a labelled `See More` action to enter its grid. An empty upload tile shows its configured label and guidance sentence.
- On the opening cover, show the configured sentence at the upper left in larger non-bold, softly translucent text with low-amplitude motion. Show `See More` as the sole forward action in the transparent bottom navigation bar. Do not show a page title or progress label over the image.
- Render Take a Breath with its title, short description, and repeating slow yellow-orange orb moving across a blue sine wave. Do not show playback controls, phase labels, timers, or links. When reduced motion is requested, stop automatic movement.
- Show the optional browser-local one-liner prompt and large multi-line input only on the final RUST gateway screen, with a divider between the RUST links and the reflection section.
- Use an accessible label for every action, visible focus states, and a recoverable alert for local storage or media failures.
