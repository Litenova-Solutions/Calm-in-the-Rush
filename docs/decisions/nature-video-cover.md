---
{"kind":"decision","id":"nature-video-cover","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-09-08"}
---

# Show bundled looping video on the Nature screen

## Decision

The Nature screen uses four bundled looping videos without on-screen credits. The Pexels license needs no attribution, so tiles stay clean. The opening cover plays the wheat field excerpt. The gallery grid plays the brook, lake, and forest excerpts. Tapping a video tile opens it as a full active view with its sentence, with the sound control beside `See More`. Tapping a photo tile opens the same view with only `See More`. `Back` and `Next` stay exclusive to the gallery grid. Upload tiles with a visitor photo open the same way and replace through tapping the open photo. The full credit record lives on the credits page and in the media provenance record.

This decision overrides the still-image rule in [the photo motion decision](on-device-photo-motion.md) for the Nature screen only. The breathing screen keeps its code-native SVG cue. Visitor uploads stay limited to still images. The app has no sharing control, so no adaptation is distributed.

## Sound

Each video carries its own bundled ambient bed: stream sounds for the brook, small waves for the lake, birds and wind for the forest, and wind in tall grass for the wheat field. All four beds are CC0. Sound is on by default and follows the active view, so only one bed ever plays. The grid itself stays silent, with no sound control. Browsers start audio at the first touch, so a visitor hears sound from the first tap. The small sound control appears only where audio can play: beside the forward action on the cover and on active video views. Videos carry no audio tracks of their own.

## Reason

The product owner asked for video on the Nature screen, one fitting sound per video, sound on by default, tappable gallery tiles, and no on-screen credits. The wheat field opens the experience. The stage shows no administration link and drops the phone frame on compact viewports, where the experience fills the screen. Pexels clips replaced the earlier Creative Commons clips because their license needs no attribution, carries no ShareAlike clause, and has no review flags. Bundled files keep the no-server boundary intact. Posters and reduced-motion stills keep the calm behavior for visitors who ask for less motion.

## Media and performance

The cover excerpt is an 8 second slowed portrait loop near 3.8 MB. The grid excerpts range near 0.5 MB to 4.6 MB. The four ambient beds range near 0.5 MB to 0.6 MB. The browser preloads only the cover video. Grid videos load lazily and show a poster frame first. Audio loads with its active view and only one bed ever plays. Reduced motion stops every video and shows its poster still.

## Revisit trigger

Revisit this decision when the product owner asks for shared or downloadable adaptations, for remote video sources, for uploads in video form, or for sound on before the first touch. Any of those changes needs a new license review, a storage review, and a performance budget.
