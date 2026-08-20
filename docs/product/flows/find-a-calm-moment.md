---
{"kind":"end-to-end-flow","id":"find-a-calm-moment","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-18","releaseRole":"primary","useCases":["calm.view-experience","calm.add-photo","calm.save-one-liner","content.manage-local-experience"],"applicableExtensions":[]}
---

# Find a calm moment

## Goal

Let a person move through a quiet local reflection flow, add personal photographs, and keep an optional short note in the current browser.

## Steps

1. Open `/` or `/demo` and see the configured Nature cover.
2. Select `See More`, review the four-tile Nature grid, and continue to Quiet Moments.
3. Review Quiet Moments, then continue to Friendly Faces and add either or both independent photographs if desired.
4. View the repeating breathing cue, then continue to the RUST gateway.
5. Use the final-page one-liner prompt to save, edit, or clear a short answer locally.

## Failure paths

- An invalid, unreadable, or unsupported image reports a recoverable message and does not replace the upload tile.
- Missing browser-local media reports a recoverable message while the screen navigation and uploads remain available.
- Browser private mode, storage eviction, cleared site data, and reset can remove local configuration, photographs, and the one-liner.
