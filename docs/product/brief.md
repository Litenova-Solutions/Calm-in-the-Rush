---
{"kind":"product","id":"calm-in-the-rush","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-14","primaryReleaseFlow":"find-a-calm-moment"}
---

# Calm in the Rush product brief

## Purpose

Calm in the Rush is a phone-framed web picture gallery for a short, unguided pause. The root route
opens the working demo at once. It has no account, goal, timer, streak, server, or remote content
service.

## Primary flow: find-a-calm-moment

1. A person opens `/`, briefly sees the supplied logo splash inside the phone screen, then sees the
   phone-framed demo with a small Admin link outside the frame.
2. They select the gallery icon inside the phone.
3. They move through the three gallery pages and select a bundled or browser-local image or video.
4. An upload tile accepts an image or video file, then becomes that media and exposes the next
   upload tile.
5. The chosen media fills the phone screen until the person opens the gallery again.

## Use cases

| ID | Use case | Status | Specification |
| :-- | :-- | :-- | :-- |
| UC-CALM-001 | View gallery | implemented | [view a scene](../domain/modules/calm/view-scene.md) |
| UC-CALM-002 | Choose gallery tile | implemented | [choose a scene](../domain/modules/calm/choose-scene.md) |
| UC-CONTENT-001 | Manage local gallery | implemented | [manage local scenes](../domain/modules/content/manage-local-scenes.md) |

## Page requirements

| Page | Purpose | Status | Specification |
| :-- | :-- | :-- | :-- |
| `/` | Run the phone-framed web demo | implemented | [root demo](../ui/landing.md) |
| `/demo` | Render the same web demo at its existing direct URL | implemented | [demo](../ui/demo.md) |
| `/admin` | Edit the local gallery in the current browser | implemented | [admin](../ui/admin.md) |

## Demo gallery

- The root route has no public header, wordmark, hero copy, footer, or visitor action group. A brief
  supplied-logo splash appears inside the phone screen before the live demo, and a small Admin link
  remains outside the phone frame.
- The application and surrounding demo canvas use a low-saturation warm yellow and sage palette rather than a neutral white interface.
- The phone frame uses a dark graphite device casing, while its internal media stage remains deep sage.
  It fills the available compact viewport. On wider screens it stops at the `container-phone` width
  token so it remains visibly a phone-framed web demo.
- The gallery icon opens the current page without navigating away from the phone frame. Its compact,
  translucent close, page-title, count, and page-navigation controls float over the tile grid so the
  tiles retain the full phone surface. The header does not show the page description. The matching
  glass header and page-navigation surfaces use the same subtle edge and stronger translucent surface.
  The empty your-people page uses a muted surface behind those bars. Each bottom action presents its
  destination page title and a directional icon.
- The first page starts with four bundled nature videos and one night-sky image. It has seven
  ordered upload spaces. Only the first empty upload space is visible; each completed upload reveals
  the next one.
- The second page starts with five bundled images of calm human activity: guitar, reading, tea,
  stretching, and gardening. It uses the same seven upload-space progression.
- The third page starts as one centered `Add a nice photo or video of yourself and/or people you
  love` control. It has six ordered upload spaces. After the first upload, the media becomes a tile
  and the next upload space appears.
- The visible tiles fill the full gallery surface behind the floating controls. When another upload
  is revealed, the grid adds a row and reduces the tile size to keep every visible tile on screen.
  Pages with more than 12 visible tiles scroll inside the gallery surface rather than producing
  unusably small tiles. An empty configured page shows a clear empty state. Moving between pages uses
  short directional motion unless reduced motion is requested.
- A selected image or video fills the phone screen. Nature videos loop with motion; selecting one
  requests sound as part of the person's action. A share control uses the browser share sheet or
  copies the demo link when sharing is unavailable.
- A light-weight sentence appears over active media and changes when another tile is selected. Its
  difference blend adapts from light to dark against the media, with a text shadow fallback.
- The translucent gallery and share controls fade after 3.5 seconds without interaction on active
  media. A pointer press inside the phone restores them, while keyboard focus keeps them visible.
- Uploaded files must be images or videos. File errors produce a recoverable message and do not
  change the current media.

## Local gallery content

The browser owns one gallery configuration and its local media blobs.

- IndexedDB database `calm-in-the-rush-local-v3` has `gallery`, `galleryUploads`, and `media` stores. The `localStorage` API is not used.
- The gallery configuration contains ordered pages and ordered tiles. A tile is either `prefilled`,
  with a bundled or locally curated image or video, or `upload`, with a label and an ordered place
  for visitor media.
- The gallery configuration also contains one to 24 local sentences for the active-media overlay.
- The browser falls back to the three bundled gallery pages when no local configuration exists.
- A visitor upload is stored only in the current browser. It never reaches a server, another browser, or a remote content service.
- Removing a page or tile removes its unreferenced local media blobs. Reset removes the v3 database
  and restores the bundled three-page gallery.
- The former v2 database is not read. This early demo intentionally has no migration or compatibility layer.

## Administration requirements

Administration manages only the current browser's gallery.

- The page separates gallery, sentences, and local data through an in-page section switcher.
- The gallery section is one page-and-tile editor. It shows pages with their tiles nested beneath them,
  lets an admin add or remove a page, and changes page order in context.
- The page lists the active-media sentences and lets an admin add or remove a sentence while at least
  one remains.
- In the tree, the admin edits a page name, adds a visitor-upload or pre-filled image or video tile,
  edits a tile, removes a tile, and changes tile order. Tiles support drag movement across pages, a
  named Move action with destination choices, and directional order controls. Moving an upload tile
  preserves its local media.
- A gallery has at least one page. Each page can hold zero or more tiles, and the admin-defined tile
  count determines the visitor-visible capacity.
- Pre-filled tile input accepts image and video files. Its title and alternative text are required so
  the phone gallery can name the media; either the metadata or file can later be updated.
- The local-data section shows current local-media storage, an estimated browser quota, reset,
  recoverable errors, and confirmation before removal or reset. It does not contain a phone preview.
- The route has no sign-in because it has no remote capability. There is no backend, audit log, cross-tab synchronization, migration, or compatibility work in this demo.

## Privacy and accessibility

Calm in the Rush has no accounts, cookies, analytics, advertising, location, camera, microphone, or tracking. The web demo sends no page configuration, tile, image, or video to a server.

Private browsing, storage eviction, cleared site data, and reset can erase browser-local gallery data. Every interaction has a keyboard path, visible focus indicator, and programmatic label. Uploaded media uses the selected file name as alternative text until an admin replaces it with a pre-filled media description.

## Content and attribution

The four bundled nature videos retain their provenance metadata. The fifth nature tile is the bundled
night-sky image. The five activity images are local generated demo assets. The supplied splash logo
retains its source URL beside the local asset. New license research and source review are outside the
current web demo scope.

## Constraints

The web demo reads bundled assets and browser-local records only. Do not add authentication, an API route, server action, server database, remote storage, browser-to-browser publication, or a remote content service.

## Acceptance criteria

| ID | Criterion | Current state |
| :-- | :-- | :-- |
| [AC-ROOT-001] | `/` briefly renders the supplied-logo splash inside the phone screen, then the phone-framed demo and small Admin link | Implemented |
| [AC-DEMO-001] | The live gallery remains inside a visible phone frame with a desktop width cap | Implemented |
| [AC-GALLERY-001] | The first two pages start with five bundled media tiles and progress through seven upload spaces to 12 tiles | Implemented |
| [AC-GALLERY-002] | The third page starts with one centered upload control and progresses through six upload spaces | Implemented |
| [AC-ADMIN-001] | Admin edits locally ordered pages and pre-filled or upload tiles | Implemented |
