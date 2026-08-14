---
{"kind":"decision","id":"on-device-photo-motion","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-14"}
---

# Keep personal photos still

## Decision

The fifth picture choice in `/demo` accepts a personal image and keeps it still. The browser creates an
object URL for the open session only. It does not write the image to IndexedDB, upload it, generate a
video, call an artificial video provider, or animate a face.

## Reason

[The photo presence evidence review](../research/photo-presence-evidence.md) supports the value of a
still, personally meaningful photograph. It does not provide a reason to add motion to this demo. A
still image also meets the current product scope without a storage, consent, deletion, or remote-service
decision.

## Revisit trigger

Revisit this decision only when the product owner asks to add personal-photo persistence or any photo
motion. That later decision must name the storage location, deletion behavior, consent boundary, and
whether the media remains entirely local.
