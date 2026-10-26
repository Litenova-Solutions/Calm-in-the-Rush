---
{
  "type": "deviation",
  "id": "deviation/no-core-tests-during-android-build-out",
  "title": "No Core Tests During the Android Build-Out",
  "owner": "A. Shafie",
  "status": "draft",
  "decider": "A. Shafie",
  "decideBy": "2026-11-09",
  "provision": "litespec/frontend/mobile/testing#test-the-core-as-plain-net",
  "reason": "The owner asked to focus this phase on building and running the Android app and to write no tests yet.",
  "reviewBy": "2026-12-31",
  "removeWhen": "The Android app's visitor flow is accepted by the owner, or the backend work starts, whichever comes first."
}
---
# No Core Tests During the Android Build-Out

## Consequences

The Domain, Application, and Infrastructure projects have no test project. The seed content, the upload placement rules, and the file store are checked only by running the app. The first change after this deviation ends adds `apps/mobile/tests/` with plain .NET tests for the handlers and the file store.
