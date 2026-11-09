# Changelog

## Unreleased

- Removed the web demo's browser-local admin page (`/admin`). The web demo now shows only the built-in content in `apps/web/lib/content/experience.ts`, and content changes are code changes. Screens, tiles, and media that someone edited through the admin in a browser are no longer read; visitor photos and feedback in that browser stay.
- Removed the phone frame from the web demo. On a phone the demo fills the screen; on a wider screen it keeps phone width in a full-height column.
- Made the web demo installable as a web app. It has a manifest per language, app icons, and a service worker that opens the demo without a connection; video and audio still need the network. Phones get an install prompt after the visitor has chosen a photo: an Install button where the browser offers one, and short instructions on iOS and on Firefox for Android.
- Replaced the web demo's Back and Next pages with one active page. It shows the chosen photo or video full screen with its own sentence and sound, and its bar has the logo (which opens About), the sound toggle, and the gallery. The gallery lists the topics; tapping a photo in a topic makes it the active photo, and the demo remembers that choice.
- Added a first-visit tour to the web demo. It points at the controls on the active page, then opens the gallery and a topic to show how to choose a photo and add your own. It can be replayed from About.
- Replaced the web demo's one-liner with feedback on About: a calm slider whose face moves from not calm to very calm and happy, and an optional comment. A one-liner saved earlier carries over as the comment.
- Removed seven unused media files from `apps/web/public/media/experience` (`audio-lake.mp3`, `cover-meadow.webp`, `nature-brook.webp`, `nature-dunes.webp`, `nature-forest.webp`, `nature-lake.webm`, `nature-lake-poster.jpg`) and the unused `packages/config` lint package.
- Removed the Expo and React Native applications, shared native packages, native CI job, and native-only documentation. The repository is now web-only.
- Made the root route the live phone-framed gallery and removed its landing header, wordmark, hero, footer, and public actions.
- Added three local gallery pages with progressive upload spaces: 12 tiles for nature, 12 tiles for quiet moments, and 6 tiles for personal media.
- Reworked the web scene admin as a local page, tile, media, and sentence editor for pre-filled and upload tiles.
- Replaced the web v2 scene database with a fresh v3 gallery database. The new format has no migration or compatibility layer.
- Added five generated calm-activity images as bundled web gallery assets.
- Restored bundled nature video playback, active-media sharing, and light-weight sentence animation.
