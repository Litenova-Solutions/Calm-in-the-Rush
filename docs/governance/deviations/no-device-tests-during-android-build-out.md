---
{
  "type": "deviation",
  "id": "deviation/no-device-tests-during-android-build-out",
  "title": "No Device Tests During the Android Build-Out",
  "owner": "A. Shafie",
  "status": "draft",
  "decider": "A. Shafie",
  "decideBy": "2026-11-09",
  "provision": "litespec/frontend/mobile/testing#prove-screens-on-a-device-or-emulator",
  "reason": "The owner asked to focus this phase on building and running the Android app and to write no tests yet.",
  "reviewBy": "2026-12-31",
  "removeWhen": "The Android app's visitor flow is accepted by the owner, or the backend work starts, whichever comes first."
}
---
# No Device Tests During the Android Build-Out

## Consequences

No screen is driven by an automated test. Each screen is checked by walking the flow on an emulator or a device before a change is committed, and the result is reported with the change.
