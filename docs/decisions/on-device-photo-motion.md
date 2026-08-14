---
{"kind":"decision","id":"on-device-photo-motion","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-14"}
---

# Keep images still and play selected videos

## Decision

Image tiles stay still. The four bundled nature videos loop after selection, and a deliberate video
selection requests its embedded sound. Browser-local video uploads can also play. The browser does
not upload media, generate a video, call an artificial video provider, or animate a face.

## Reason

[The photo presence evidence review](../research/photo-presence-evidence.md) supports the value of a
still, personally meaningful photograph. Images remain still for that reason. Bundled nature videos
are retained media with their own audio tracks, not generated motion. Motion and sound start only
after a person's video selection and honor reduced-motion preferences.

## Revisit trigger

Revisit this decision when the product owner asks for generated motion, remote media handling, or a
different video playback policy. That later decision must name the consent boundary, storage location,
deletion behavior, and whether the media remains entirely local.
