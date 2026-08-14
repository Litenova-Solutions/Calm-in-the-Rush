# Changelog

## Unreleased

- Sized the demo phone frame from the available viewport, capped it on wide screens, and changed the
  sentence treatment so the grid hides it and a selected picture introduces a new sentence with a
  small reduced-motion-safe transition.
- Restored `/demo` as the live experience route and placed it inside a visible phone frame. The
  landing page remains a static preview that links to the demo.
- Added a fifth demo choice for a personal image. The selected image stays still in memory for the
  open session and is never uploaded or turned into a video.
- Added five default nature sentences, random sentence selection after each video or personal-photo
  choice, and browser-local sentence creation in `/admin`.
- Kept scene media, sentence data, and administration browser-local. The new IndexedDB database
  intentionally starts fresh without migration or compatibility handling.
- Removed the automated test suite from this early demo and retained lint, type, documentation,
  content, formatting, and build checks.
