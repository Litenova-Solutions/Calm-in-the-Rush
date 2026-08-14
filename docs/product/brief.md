---
{"kind":"product","id":"calm-in-the-rush","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-14","primaryReleaseFlow":"find-a-calm-moment"}
---

# Calm in the Rush product brief

## Purpose

Calm in the Rush gives a person a short, unguided pause. It pairs real nature scenes with the ambient
sound captured in those places. It does not ask for an account, a goal, a timer, or a streak.

The pictures carry the product. A short sentence appears where a picture cannot carry itself, never
as an instruction or lesson. English is the only language in this demo.

## Primary flow: find-a-calm-moment

1. A person opens `/` and sees the product landing page with a static phone preview.
2. They select `Open the demo` and reach `/demo`.
3. The demo presents the live experience inside a phone frame. Selecting its lead poster reveals
   four bundled nature videos and a fifth option to choose a personal photo.
4. Selecting a bundled scene starts its video and embedded ambient sound. Selecting a personal photo
   keeps it still and starts no video or sound.
5. Each selected video or photo replaces the displayed sentence with a random nature sentence from
   the current browser's sentence bank.
6. A person can return to the picture choices, share the demo URL, or leave without an account.

This is an early browser-local demo. It has no automated test suite, migration path, compatibility
layer, backend, or cross-tab coordination.

## Use cases

| ID             | Use case            | Status      | Specification                                                   |
| :------------- | :------------------ | :---------- | :-------------------------------------------------------------- |
| UC-CALM-001    | View a scene        | implemented | [view a scene](../domain/modules/calm/view-scene.md)           |
| UC-CALM-002    | Choose a scene      | implemented | [choose a scene](../domain/modules/calm/choose-scene.md)       |
| UC-CALM-003    | Start scene sound   | implemented | [control sound](../domain/modules/calm/control-sound.md)       |
| UC-CALM-004    | Share a moment      | implemented | [share a moment](../domain/modules/calm/share-moment.md)       |
| UC-CONTENT-001 | Manage local scenes | implemented | [manage local scenes](../domain/modules/content/manage-local-scenes.md) |

The web use cases describe `/demo`. Native parity remains planned.

## Page requirements

| Page            | Purpose                                                    | Status      | Specification                           |
| :-------------- | :--------------------------------------------------------- | :---------- | :-------------------------------------- |
| `/`             | Explain the product and link to the demo                   | implemented | [landing](../ui/landing.md)             |
| `/demo`         | Run the browser experience in a visible phone frame        | implemented | [demo](../ui/demo.md)                   |
| `/requirements` | Publish this plan in a readable form                       | implemented | [requirements](../ui/requirements.md)   |
| `/evidence`     | Publish the interface and photo evidence                   | implemented | [evidence](../ui/evidence.md)           |
| `/admin`        | Curate local scenes and sentences in the current browser   | implemented | [admin](../ui/admin.md)                 |
| Native app      | Run the same flow in Expo                                  | planned     | [native experience](../ui/native-experience.md) |

`/requirements` and `/evidence` exist for the people building the demo. They are not part of the
visitor's path through the product.

## Landing requirements

- Use the heading `A quiet minute in the middle of everything.`.
- Keep the existing header, hero copy, static phone preview, and compact footer.
- Link the primary action and header action to `/demo` with the label `Open the demo`.
- Do not request demo media on the landing route.
- Keep the interface palette neutral and desaturated so the photograph carries saturation and color.

## Demo requirements

- Center the live experience in a visible phone frame on `/demo`. On a phone, it uses the available
  viewport below the demo header. On wider screens, it stops at the `container-phone` width token.
- Start with the first bundled poster and make no video request until a person selects a bundled
  scene.
- Reveal four bundled nature posters and a fifth `Use your own photo` option.
- The fifth option accepts an image file only. It never accepts a visitor video, creates no generated
  video, and sends no file to a server.
- Keep the chosen photo in memory for the open demo session. Replacing it or leaving the page releases
  the browser object URL.
- Select a random nature sentence from the current sentence bank whenever a bundled video or personal
  photo is selected. When more than one nature sentence exists, do not repeat the immediately previous
  sentence. Hide the sentence while the picture grid is open, then fade and lift the new sentence into
  view after selection when reduced motion is not requested.
- Selecting a bundled poster starts the existing video and its embedded ambient sound unmuted. There
  is no in-product mute control. The selection is the deliberate action that permits sound.
- When reduced motion is active, show the selected scene's still poster while its embedded ambient
  sound remains available.
- Fade the sentence and controls after six idle seconds. Pointer activity and keyboard focus make
  them visible again.
- Pause selected scene media while the page is hidden. Show the still poster and a quiet message if
  video or sound fails to load.
- Let a person share `/demo` through the device share surface or a copied link fallback.

## Content bank requirements

The browser owns one local scene catalog and one local English sentence bank.

- The scene catalog starts with the four existing bundled nature videos and posters.
- The sentence bank starts with five nature sentences: `Nothing needs an answer here.`, `You can stay
  with this view.`, `Let the next breath arrive on its own.`, `There is room for this moment.`, and
  `There is no next step to find.`.
- `/admin` can add a nature sentence of up to 160 characters. Added sentences appear in the random
  selection pool after the demo is opened again or the admin preview is remounted.
- IndexedDB database `calm-in-the-rush-local-v2` holds catalog metadata, locally curated video and
  poster blobs, and the sentence bank. The `localStorage` API is not used.
- A personal photo selected in `/demo` is not a catalog record and is not written to IndexedDB.
- There is no API route, server action, remote database, cloud bucket, browser-to-browser publication,
  cross-tab message channel, or revision synchronization.
- Local records have no migration or backward compatibility promise. The `v2` database intentionally
  starts fresh rather than reading the former browser-local database.
- Draft scenes stay out of the demo. `Show in experience` changes only the current browser's catalog.

## Interface evidence and product claims

The interface evidence review records why the surrounding UI stays neutral and low saturation rather
than assigning a calming effect to a hue. The review also records the limits of a short screen break:
the product offers a quiet minute and makes no medical, treatment, attention, or productivity claim.

The photo evidence review supports a still, personally meaningful photograph. It does not support
generated facial motion. The demo therefore keeps a personal photo still and calls no artificial video
service.

The canonical sources are [the interface evidence review](../research/calm-interface-evidence.md) and
[the photo presence evidence review](../research/photo-presence-evidence.md). The `/evidence` page
publishes their claims and limits in plain language.

## Administration requirements

Administration manages only the current browser's content. It retains the existing title and MP4
scene workflow, including a poster derived from the first video frame, draft and shown-in-experience
states, ordering, storage estimate, preview, recovery text, and confirmation before deletion or reset.

It also lists the active nature sentence bank and provides a labelled field to add a sentence. Reset
removes local scenes and added sentences, then restores the bundled scenes and default sentences.

The route has no sign-in because it has no remote capability. There is no backend, audit log,
cross-tab synchronization, migration, or compatibility work in this demo.

## Privacy and accessibility

Calm in the Rush has no accounts for visitors, cookies, analytics, advertising, location, camera,
microphone, or tracking. The demo sends no scene catalog, locally curated media, added sentence, or
personal photo to a server.

Private browsing, storage eviction, cleared site data, and a local format reset can erase browser
content. A personal photo lasts only for the open demo session.

Every part of the product uses visible focus outlines, keyboard operation, screen-reader labels, and a
minimum 44 by 44 target size. The selected personal photo has its file name as alternative text.

## Content and attribution

The four bundled nature scenes retain their current provenance metadata. New license research, source
review, and a separate music bank are out of scope for this early demo. The stress section has no
media and does not appear in the demo.

## How it is built

The technical constraints live in [the architecture constraints](../decisions/architecture-constraints.md).
The short version: the early web demo reads bundled media and browser-local records only. It has no
server or remote storage.

## Explicit non-goals

Calm in the Rush does not include visitor accounts, payments, notifications, analytics, medical
claims, a backend, migration, automated tests, cross-tab synchronization, a compatibility layer, or
visitor video upload. It calls no artificial video service and generates no face.

## Acceptance criteria

| ID               | Criterion                                                                  | Current state |
| :--------------- | :------------------------------------------------------------------------- | :------------ |
| [AC-LAND-001]    | The landing route remains static and links to `/demo`                     | Implemented   |
| [AC-DEMO-001]    | `/demo` renders the live experience in a visible phone frame              | Implemented   |
| [AC-BANK-001]    | The demo shows four bundled video choices and one personal photo choice   | Implemented   |
| [AC-SENTENCE-001] | Each selected video or photo chooses a different random nature sentence | Implemented   |
| [AC-ADMIN-001]   | Admin adds local sentences and retains the existing local scene workflow  | Implemented   |
| [AC-SOUND-001]   | A selected bundled video starts unmuted embedded ambient sound             | Implemented   |
| [AC-NATIVE-001]  | The Expo experience follows the current web interaction model             | Deferred      |

## Future work

The next product decisions are not scheduled: a stress scene set, native parity, a hosted content
bank, and any persistence or deletion model for personal photos. Start backend work only when the
product owner asks for it.

Source: [Calm in the Rush repository](https://github.com/Litenova-Solutions/Calm-in-the-Rush)
