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

## Testing

The project is in early development and has no automated tests. Do not add unit, integration,
end-to-end, or device tests to the web demo or the Android app, and do not add a test runner or
test configuration. Verify a change by walking the changed flow instead: in a browser through the
Playwright CLI or Browser MCP for the web demo, on an emulator or device for the Android app. Check
phone and desktop widths, report what you saw, and run `pnpm verify` for web changes.

## Applications

| Application        | Path                                                                      | Stack                                   |
| :----------------- | :------------------------------------------------------------------------ | :-------------------------------------- |
| Android app        | `apps/mobile/src/CalmInTheRush.Android`                                   | LiteSpec `android` (.NET for Android)   |
| Shared mobile core | `apps/mobile/src/CalmInTheRush.Domain`, `.Application`, `.Infrastructure` | plain .NET                              |
| Web demo           | `apps/web`                                                                | Next.js, outside the LiteSpec selection |

The mobile solution is `apps/mobile/CalmInTheRush.Mobile.slnx`. The Android app packs its media
from `apps/web/public/media/experience/`, so the web demo stays the single media source.

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
remote content service. Visitor photos and feedback stay in the app's private storage, and in
browser storage on the web. Add no NuGet package without a decision. Preserve the untracked `.fuse/`
directory.

## Visitor navigation

The web demo has one active page and a few pages around it, not a linear sequence:

- The active page shows the visitor's chosen photo or video full screen, with its own sentence and sound. A still photo without sound keeps the opening ambience. The first visit shows the opening cover, and the last choice is remembered per browser.
- The active page bar always shows the brand logo on the left, which opens About, and the sound toggle and gallery button on the right.
- The gallery lists topics: each gallery screen and breathing screen of the built-in content in `apps/web/lib/content/experience.ts`, in that order. There is no admin; content changes are code changes. A topic opens its photo grid or breathing cue. Tapping a photo makes it the active photo and returns to the active page; the grid marks the current choice. There is no separate full-screen photo viewer.
- About is one plain page, with no cards: the logo, the gateway description and links, the feedback, and a way to replay the tour. Feedback is a calm slider in the style of an emoji slider sticker and an optional comment, saved on the device. The slider face is the brand smiley with eyes in place of the logo letters, drawn in `apps/web/app/components/experience/CalmFace.tsx`; it morphs from a frown (0, not calm) to the logo smile with closed eyes (100, very calm and happy) and grows while held.
- Every view starts with the same 3.5rem bar and 2.5rem round controls on a 1rem side gutter. On pages with content the bar is frosted and the content scrolls under it. Back walks up one level through browser history, so the phone's back gesture matches the back button.
- A first-visit tour walks the visitor through the app: it lights the sound, logo, and gallery controls on the active page, then opens the gallery to light a topic, then opens that topic to light a photo and an empty upload tile. Tapping the lit target advances it. Finishing or skipping returns to the active page; leaving by the back gesture ends it where it is. It runs once per browser and can be replayed from About.
- Do not add a Back and Next pager, a page counter, or a second route to the same view.

## Visitor visual hierarchy

- Active-image screens make the image primary. Do not show a page title, progress label, or added actions over an active image. The bar controls listed under Visitor navigation are the only exception.
- An assigned sentence on active media stays calm, non-bold, and edge-aligned. A slow low-amplitude motion cue is permitted when it respects reduced-motion preferences. Do not turn the sentence into a headline.
- Gallery screens use borderless, gap-free two-column image grids. Do not add card chrome, captions, metadata, or surrounding copy unless an explicit product requirement needs it.
- An empty upload tile is an explicit exception to the gallery text rule. Show its configured prompt so people know which photo to add.
- Put personal reflection and feedback controls on About, never as a persistent control over active media.
- Cards that float at the bottom (the tour, the install prompt, status messages) share one style. The install prompt never appears over an active image or during the tour.
- A calming motion screen shows only its necessary title, short description, and visual cue. Do not add playback controls, phase labels, timers, or external links without an explicit product decision.
