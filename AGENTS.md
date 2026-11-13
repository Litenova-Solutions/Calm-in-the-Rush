# Calm in the Rush agent guide

## LiteSpec

This project follows LiteSpec 3.0.0: size small, shape client-only, stacks android, extensions none.
Read `litespec.project.json` before changing the project, then the LiteSpec pages the task touches:
the shared mobile pages under `docs/frontend/mobile/` and the Android stack under
`docs/frontend/mobile/android/` of the LiteSpec release. (litespec/core/agent#select-task-context)

A deviation in `docs/governance/deviations/` overrides the provision it names until its review
date. Decisions live in `docs/intent/decisions/`. (litespec/core/agent#apply-guidance-precedence)

- `deviation/web-demo-outside-the-stack-selection`: the Next.js demo in `apps/web` is outside the
  LiteSpec selection and keeps its own pnpm checks.
- `deviation/no-core-tests-during-android-build-out` and
  `deviation/no-device-tests-during-android-build-out`: this phase builds the Android app without
  tests. Walk the changed flow on an emulator or device instead, and report the result.

Read `C:\Users\a.shafie\.config\writing-rules.md` before editing prose. Keep prose ASCII.

## Applications

| Application        | Path                                                                      | Stack                                   |
| :----------------- | :------------------------------------------------------------------------ | :-------------------------------------- |
| Android app        | `apps/mobile/src/CalmInTheRush.Android`                                   | LiteSpec `android` (.NET for Android)   |
| Shared mobile core | `apps/mobile/src/CalmInTheRush.Domain`, `.Application`, `.Infrastructure` | plain .NET                              |
| Web demo           | `apps/web`                                                                | Next.js, outside the LiteSpec selection |

The mobile solution is `apps/mobile/CalmInTheRush.Mobile.slnx`. The Android app packs its media
from `apps/web/public/media/experience/`, so the web demo stays the single media source.

## Names

The product name is always `Calm in the Rush` in English and `RUST in de Reuring` in Dutch. Do not
use `Rust in de Drukte` or another translation in visitor-facing copy, metadata, manifests, or app
labels.

## Commands

```bash
dotnet build apps/mobile/CalmInTheRush.Mobile.slnx
dotnet build apps/mobile/src/CalmInTheRush.Android -t:Run      # install and start on a device or emulator
dotnet publish apps/mobile/src/CalmInTheRush.Android -c Release # Android App Bundle
pnpm install --frozen-lockfile
pnpm dev:web
pnpm verify
```

Do not add authentication, a server, a database, analytics, cookies, uploads to a server, or a
remote content service. Visitor photos and the one-liner stay in the app's private storage, and
in IndexedDB on the web. Add no NuGet package without a decision. Preserve the untracked `.fuse/`
directory.

## Visitor visual hierarchy

- Active-image screens make the image primary. Do not show a page title, progress label, persistent utility, or more than one low-prominence action over an active image.
- An assigned sentence on active media stays calm, non-bold, and edge-aligned. A slow low-amplitude motion cue is permitted when it respects reduced-motion preferences. Do not turn the sentence into a headline.
- Gallery screens use borderless, gap-free two-column image grids. Do not add card chrome, captions, metadata, or surrounding copy unless an explicit product requirement needs it.
- An empty upload tile is an explicit exception to the gallery text rule. Show its configured prompt so people know which photo to add.
- Put personal reflection controls at an intentional endpoint, never as a persistent control over active media.
- A calming motion screen shows only its necessary title, short description, and visual cue. Do not add playback controls, phase labels, timers, or external links without an explicit product decision.
