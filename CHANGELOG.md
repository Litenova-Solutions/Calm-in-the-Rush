# Changelog

## Unreleased

- Made the web demo fit phones: it fills the screen in both orientations, keeps clear of the notch and home indicator, uses 44-pixel touch targets, moves between screens with a horizontal swipe, and shows the phone frame only on screens with room for it.
- Made the web demo installable: a manifest per language with the CALM or RUST logo as the app icon, a service worker that opens the installed demo without a connection, and an install invitation on the logo screen for phones.
- Started the cover's ambient sound at launch where the browser allows it, and otherwise on the visitor's first tap or key press anywhere. The sound fades in, and the sound button shows when the browser is still holding it.
- Added H.264 MP4 copies of the four flow videos for iPhones and older browsers. The MP4 is also the smaller file, so the web demo plays it first; the Android app keeps the WebM files.
- Replaced the emoji on empty Relaxed Faces tiles with drawn faces in the brand smiley colors, centered the breathing cue, added a soft fade between screens, and removed the hairlines between empty gallery tiles.
- Added a calm slider to the final reflection screen, in the style of an emoji slider sticker: the visitor drags the brand smiley from not calm to calm and happy, its expression follows the slider, and the answer is saved in the browser when they let go.
- Removed the Expo and React Native applications, shared native packages, native CI job, and native-only documentation. The repository is now web-only.
- Made the root route the live phone-framed gallery and removed its landing header, wordmark, hero, footer, and public actions.
- Added three local gallery pages with progressive upload spaces: 12 tiles for nature, 12 tiles for quiet moments, and 6 tiles for personal media.
- Reworked the web scene admin as a local page, tile, media, and sentence editor for pre-filled and upload tiles.
- Replaced the web v2 scene database with a fresh v3 gallery database. The new format has no migration or compatibility layer.
- Added five generated calm-activity images as bundled web gallery assets.
- Restored bundled nature video playback, active-media sharing, and light-weight sentence animation.
