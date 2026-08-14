---
{"kind":"end-to-end-flow","id":"find-a-calm-moment","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-14","releaseRole":"primary","useCases":["calm.view-scene","calm.choose-scene","content.manage-local-scenes"],"applicableExtensions":[]}
---

# Find a calm moment

## Goal

Let a person choose an image or video from a phone-framed local gallery.

## Steps

1. Open `/`, briefly see the supplied logo splash inside the phone screen, then see the selected image
   or video inside the phone frame.
2. Select the gallery icon.
3. Browse the nature, quiet-moments, and your-people pages.
4. Select an existing tile or select the visible upload space and choose an image or video file.
5. See the selected media in the phone frame. A completed upload reveals the next upload space.

## Failure paths

- An invalid or unreadable file reports a recoverable message and does not fill an upload space.
- Missing local media reports a recoverable message while the gallery control remains available.
- Browser private mode, storage eviction, and cleared site data can remove local page setup and uploaded media.
