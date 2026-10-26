---
{
  "type": "decision",
  "id": "decision/0002-minimum-android-version",
  "title": "Support Android 8.0 and Later",
  "owner": "A. Shafie",
  "status": "draft",
  "decider": "A. Shafie",
  "decideBy": "2026-11-09",
  "options": [
    {
      "name": "Android 8.0 (API 26)",
      "for": "Reaches nearly every active device, and gives the app ValueAnimator.AreAnimatorsEnabled for the reduced-motion check and Context.GetColor without compatibility code.",
      "against": "Keeps two code paths for edge-to-edge drawing and system bar icons, because the modern window insets API starts at API 30."
    },
    {
      "name": "Android 11 (API 30)",
      "for": "One code path for edge-to-edge drawing, insets, and system bar appearance.",
      "against": "Leaves out the devices still on Android 8 to 10."
    }
  ],
  "changeWhen": "Devices below Android 11 fall under a share of visitors the owner considers negligible, or a feature needs an API the floor does not offer."
}
---
# Support Android 8.0 and Later

## Context

The Android stack asks every app to set `SupportedOSPlatformVersion` and record why. The visitor flow needs a reduced-motion check, edge-to-edge drawing under the system bars, and a system photo picker. The modern picker starts at Android 13, the modern insets API at Android 11, and the animator check at Android 8.0.

## Decision

Set `SupportedOSPlatformVersion` to 26. Use the Android 13 photo picker where it exists and the document picker below it, and the Android 11 insets API where it exists and the legacy system UI flags below it.

## Consequences

`SystemBars` and the picker in `MainActivity` keep a second path for older devices. Raising the floor to 30 later removes that path without touching any screen.
