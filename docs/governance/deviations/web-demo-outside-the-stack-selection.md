---
{
  "type": "deviation",
  "id": "deviation/web-demo-outside-the-stack-selection",
  "title": "Web Demo Outside the Stack Selection",
  "owner": "A. Shafie",
  "status": "draft",
  "decider": "A. Shafie",
  "decideBy": "2026-11-09",
  "provision": "litespec/core/scope#select-a-size-a-shape-and-stacks",
  "reason": "The Next.js web demo in apps/web predates the LiteSpec adoption and follows none of the React stack's pages, so the project selects only the android stack and leaves the demo outside the selection.",
  "reviewBy": "2027-01-31",
  "removeWhen": "The web demo is rebuilt on the react stack, or it is retired once the mobile apps replace it."
}
---
# Web Demo Outside the Stack Selection

## Consequences

`litespec.project.json` names one frontend, the Android app. The web demo keeps its own pnpm checks and is not covered by any LiteSpec page or check. The demo stays the media source: the Android app packs the demo's files from `apps/web/public/media/experience/` instead of a second copy.
