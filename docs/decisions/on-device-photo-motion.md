---
{"kind":"decision","id":"on-device-photo-motion","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-18"}
---

# Use still photographs and a code-native breathing cue

## Decision

Nature, Quiet Moments, and Friendly Faces use still images. Take a Breath uses a code-native SVG: a glowing yellow-orange orb moves across a smooth blue sine wave on a blue-white background. The movement follows the stakeholder-supplied breathing visualisation. It has no embedded video and no generated video asset.

## Reason

[The photo presence evidence review](../research/photo-presence-evidence.md) supports the value of a still, personally meaningful photograph. The breathing cue is lighter than a video download, works without a remote service, and stays limited to a title, short description, and slow visual motion. It stops when reduced motion is requested.

## Revisit trigger

Revisit this decision when the product owner explicitly asks to host or embed a breathing video. That later decision must name the consent boundary, storage location, deletion behavior, performance budget, and reduced-motion behavior.
