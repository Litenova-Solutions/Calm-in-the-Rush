---
{"kind":"end-to-end-flow","id":"find-a-calm-moment","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-14","releaseRole":"primary","useCases":["calm.view-scene","calm.choose-scene","calm.control-sound","calm.share-moment","content.manage-local-scenes"],"applicableExtensions":[]}
---

# Find a calm moment

## Goal

Give a person a quiet scene through the dedicated phone-framed demo.

## Steps

1. Open `/` and select `Open the demo`.
2. On `/demo`, select the lead nature poster.
3. Select one of four bundled nature posters, or select `Use your own photo` and choose an image.
4. A bundled poster plays its video with embedded ambient sound. A personal photo stays still.
5. The selected picture changes the displayed sentence to a random nature sentence from the local
   sentence bank.
6. Choose another picture, share the demo URL, or leave the page.

## Failure paths

- A missing or unreadable video keeps the poster visible and shows an inline status.
- Reduced motion keeps the poster visible while selected ambient sound remains available.
- An unreadable personal photo shows a recoverable message and does not upload the file.
- A failed share reports a recoverable message and keeps the picture open.
- Draft local scenes stay out of the frame.
