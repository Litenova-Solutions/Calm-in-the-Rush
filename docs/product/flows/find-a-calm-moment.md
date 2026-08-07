---
{"kind":"end-to-end-flow","id":"find-a-calm-moment","specStatus":"approved","implementationStatus":"planned","owner":"Product and engineering","lastReviewed":"2026-08-07","releaseRole":"primary","useCases":["calm.view-scene","calm.choose-scene","calm.control-sound","calm.share-moment","content.manage-local-scenes"],"applicableExtensions":[]}
---

# Find a calm moment

## Goal

Give a person a quiet scene in one short path from landing page to media playback.

## Steps

1. Open `/`.
2. Read the purpose and select `Open the demo`.
3. Confirm the first published scene is visible and muted.
4. Open the scene picker, select another published scene, and close the sheet.
5. Share the canonical demo URL through the available adapter.

## Failure paths

- A missing or unreadable video keeps the poster visible and shows an inline status.
- Reduced motion keeps the poster visible and does not play the video.
- A failed share reports a recoverable message and keeps the scene open.
- A catalog with drafts hides those drafts from the demo.

## Evidence

`[AC-FLOW-001]` is verified by the browser demo flow test after the required controls, focus return,
muted start, scene switch, and share fallback assertions pass.
