---
{"kind":"product","id":"calm-in-the-rush","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-07","primaryReleaseFlow":"find-a-calm-moment"}
---

# Calm in the Rush product brief

## Purpose

Calm in the Rush gives a person a short, unguided pause. The demo pairs a real nature scene
with the ambient sound captured in that place. It does not ask for an account, a goal, a timer,
or a streak.

The audience is a person using a phone or desktop who wants a quiet minute without a lesson or
notification. English is the only language in this demo.

## Primary flow: find-a-calm-moment

1. A person opens the landing page and reads the purpose.
2. They select Open the demo.
3. The demo opens the first published scene with video muted.
4. They may choose another scene or share the page. The current visual demo keeps playback muted;
   sound activation remains a planned follow-up interaction.
5. They may stay on the scene for any length of time and leave without an account.

The use-case and page specifications are `planned` until their linked tests pass. A specification
may become `verified` only when the named test evidence is recorded.

## Use cases

| ID             | Use case            | Status  | Specification                                                   |
| :------------- | :------------------ | :------ | :-------------------------------------------------------------- |
| UC-CALM-001    | View a scene        | planned | [view a scene](../domain/modules/calm/view-scene.md)                    |
| UC-CALM-002    | Choose a scene      | planned | [choose a scene](../domain/modules/calm/choose-scene.md)                |
| UC-CALM-003    | Control sound       | planned | [control sound](../domain/modules/calm/control-sound.md)                |
| UC-CALM-004    | Share a moment      | planned | [share a moment](../domain/modules/calm/share-moment.md)                |
| UC-CONTENT-001 | Manage local scenes | planned | [manage local scenes](../domain/modules/content/manage-local-scenes.md) |

## Page requirements

| Page            | Purpose                                  | Status  | Specification                                   |
| :-------------- | :--------------------------------------- | :------ | :---------------------------------------------- |
| `/`             | Explain the product and open the demo    | planned | [landing](../ui/landing.md)                     |
| `/requirements` | Publish this plan in a readable form     | planned | [requirements](../ui/requirements.md)           |
| `/demo`         | Run the browser calm experience          | planned | [demo](../ui/demo.md)                           |
| `/admin`        | Edit content in the current browser only | planned | [admin](../ui/admin.md)                         |
| Native app      | Run the same flow in Expo                | planned | [native experience](../ui/native-experience.md) |

## Landing requirements

- Use the heading `A quiet minute in the middle of everything.`.
- Show a static lake poster in a phone-shaped preview. Do not request landing video.
- Link to the demo, this plan, the source repository, privacy, and license.
- Keep the landing page focused on the header, hero, and compact footer.

## Demo requirements

- Fill a phone viewport and center a 9 by 19.5 surface on wider screens.
- Start video muted and keep playback muted in the current visual demo. Sound activation remains
  planned so the scene surface can stay focused on the image.
- Fade the heading and dock after six idle seconds. Focus keeps them visible.
- Open a bottom scene sheet with image-only poster tiles. Scene names and credits remain available
  through screen-reader labels and are not rendered over the pictures.
- Support native share, Web Share, and clipboard fallback.
- Pause media when the page is hidden and show a poster with a quiet error message on load failure.
- Show a poster and no video playback when reduced motion is active.
- Keep every control at least 44 by 44 CSS pixels or native points.

## Administration requirements

The route is public and is not a security boundary. A persistent banner must state:

> Local demo admin. Changes stay in this browser and are not published to other people.

The form supports scene metadata, MP4 video, JPEG, PNG, or WebP posters, embedded-audio
confirmation, draft and published states, order controls, a shared phone preview, quota display,
recoverable validation messages, and a reset confirmation. The browser stores content in IndexedDB.
No route, server action, API, account, cloud storage, or remote content write is allowed.

## Privacy and accessibility

The demo has no accounts, cookies, analytics, advertising, location, camera, microphone, or tracking.
Uploaded files and metadata never leave the current browser. Browser private mode, storage eviction,
or cleared site data may erase local changes.

Use semantic headings, visible focus rings, keyboard operation, screen-reader labels, text nodes for
user content, reduced-motion behavior, and a minimum 44 by 44 target size. Do not use raw HTML in
the rendered requirements markdown.

## Content and attribution

The seed catalog has four nature scenes. Each scene records creator, source URL, license identifier,
license URL, and changes made. Adapted clips are trimmed, cropped to portrait, transcoded to H.264
with AAC audio, and used to derive a poster frame. The wheat and lake Commons pages carry review-needed
metadata. This project retains those files for the demo and does not describe them as legally cleared.

## Architecture constraints

- Use pnpm workspaces with deployables in `apps/` and shared packages in `packages/`.
- Use Next.js for the web origin and Expo Router for native routes.
- Use React Native Paper components with the governed theme and project-owned wrappers in `@calm/ui`.
- Keep scene schema and seed media in `@calm/content`.
- Keep state and presentation in `@calm/experience`.
- Use IndexedDB only for same-browser demo content. There is no server database.
- Resolve media through public package exports. Application code must not import package-internal paths.
- Pin the toolchain listed in the repository root package manifest.

## Explicit non-goals

This demo does not include authentication, synchronization, a remote CMS, a server database, object
storage, payments, notifications, analytics, medical claims, store publication, or a compatibility
layer for the old static page.

## Acceptance criteria

| ID             | Criterion                                                                          | Evidence                       |
| :------------- | :--------------------------------------------------------------------------------- | :----------------------------- |
| [AC-LAND-001]    | The landing page has the required hierarchy, links, and static hero poster         | Playwright landing tests       |
| [AC-REQ-001]     | Requirements render from this file and reject raw HTML                             | Requirements component tests   |
| [AC-DEMO-001]    | Demo works at all four required viewport sizes without horizontal overflow         | Playwright demo tests          |
| [AC-ADMIN-001]   | A local draft can be saved, published, reloaded, and reset without a network write | IndexedDB and Playwright tests |
| [AC-PRIV-001]    | Requests contain no analytics, advertising, or third-party font calls              | Playwright request test        |
| [AC-CONTENT-001] | Seed paths, media metadata, licenses, and required published state validate        | Content validator              |
| [AC-DOCS-001]    | Links, headings, metadata, and status values validate                              | Documentation validator        |
| [AC-NATIVE-001]  | Expo exports Android, iOS, and web bundles and consumes shared packages            | Native CI job                  |

## Future work

Future work may add more scenes after license review, localization, a stronger native media cache,
and a hosted content workflow. Those ideas are outside this local demo and require new privacy and
operations decisions.

Source: [Calm in the Rush repository](https://github.com/Litenova-Solutions/Calm-in-the-Rush)
