# Calm in the Rush App Requirements

## 1. Product purpose

Calm in the Rush is a nonprofit, open-source wellness app. It gives people a short moment of calm and joy through real nature footage and the sound recorded with that footage.

The experience must not use questionnaires, affirmations, goals, guided exercises, streaks, progress indicators, or notification patterns.

## 2. Core experience

- Open directly on one full-screen nature scene.
- Keep the video as the main focus.
- Show only the heading "Take a breath." over the scene.
- Place Sound, Another, and Share controls at the bottom.
- Do not require an introduction, onboarding flow, account, or multi-screen journey.
- Let the user stay with the current scene for as long as they want.

## 3. Nature video and sound

- Use real, slow-paced nature recordings with sound captured at the same place and time as the picture.
- Do not add synthesized audio, stock audio from another recording, music, binaural beats, generated drones, or Web Audio API tones.
- The picture and sound must always come from the same source recording.
- Prefer clips of at least 12 to 20 seconds so the loop repeat is rarely noticed. Do not chase a seamless loop with a baked end-to-start crossfade: crossfading moving water, foliage, or rain onto itself produces a visible double-exposure ghost. Choose steady footage where an honest restart is unobtrusive instead.
- Encode with a healthy bitrate; do not starve high-motion water or rain footage, which needs far more bits than a fixed size cap allows. Quality of the scene comes before payload size.
- Keep motion calm and easy to follow, such as flowing water, a field moving in wind, or still misty water.
- Avoid rapid cuts, camera shakes, time-lapse footage, abrupt sound changes, high-motion scenes, and any human-made structures (buildings, vehicles, signage) in frame.
- Use a local poster image for every scene while its video is unavailable or paused.
- The demo plays media from local files. The app may stream media from the project's own origin or CDN; it must still collect no personal data (see section 11). Do not embed a third-party player or tracker.

### Current approved scenes

Encoded for the demo as portrait H.264 (720x1560) with AAC stereo audio carried from the source. All footage is real, retains its originally captured sound, and is cleared for redistribution by this open-source project. Scenes are ordered by pace: the app opens on the stillest scene (the misty lake) and keeps the more energetic flowing brook as the last option, because slower motion is calmer to arrive on and the small still clip also loads fastest.

| Order | Scene | Recording source | Creator / License | Audio |
|---|---|---|---|---|
| 1 (opening) | Misty mountain lake | https://commons.wikimedia.org/wiki/File:Misty_Morning_at_Lake_McDonald_(25569241623).webm | GlacierNPS, Public Domain | quiet lake ambience |
| 2 | Sunlit forest | https://commons.wikimedia.org/wiki/File:Valla_forest_Nature_reserve_-_A_quiet_place.webm | Fredrik Johansson, CC BY 3.0 | forest birdsong |
| 3 | Wheat field in the wind | https://commons.wikimedia.org/wiki/File:ASMR_field_of_wheat_-_nature.webm | Coup 53, CC BY 3.0 | wind through the field |
| 4 | Mountain brook | https://commons.wikimedia.org/wiki/File:Mountain_brook_in_Himalayas.webm | Poojilsharma07, CC BY-SA 4.0 | flowing stream water |

The repository must retain the source URL, creator, and license details for every media asset. Clips whose license requires attribution (CC BY, CC BY-SA) keep their credit in the source list. New scenes must permit use and redistribution by this open-source project.

## 4. Sound behavior

- Request video playback with sound enabled when the app opens.
- If browser autoplay policy blocks audible playback, start the picture silently and enable its original sound on the first user tap.
- Provide a clear sound toggle with a minimum 44 by 44 px touch target.
- The toggle must report its current state with `aria-pressed` and a specific accessible label.
- Keep playback volume low enough for comfortable listening while preserving the recording's natural character.
- Changing scenes must change both picture and sound together. Sound from the previous scene must stop when its picture disappears.

## 5. Responsive layout

- On desktop, center the app in a portrait surface with a 9:19.5 aspect ratio.
- Leave at least 20 px between the app surface and each side of a narrow desktop window.
- Use rounded corners and a quiet blue-green page background on desktop.
- At viewport widths of 700 px or less, fill the full browser width and `100dvh` height.
- Remove the desktop border, corner radius, and shadow on mobile.
- Cover the full app surface with the active video without stretching it.
- Respect safe-area insets around the bottom controls on mobile devices.

## 6. Visual design

- Keep the interface low-saturation and calm.
- Use deep muted teal `#10252b`, warm off-white `#eef1e8`, and muted sage `#b8cbbd` as the core interface colors.
- Do not use red, orange, bright yellow, alert badges, loading spinners, or progress bars.
- Use Nunito at weight 600 for the heading and control labels, with a system sans-serif fallback.
- Keep text to the heading and short control labels. Do not add explanatory paragraphs over the scene.
- Add only enough overlay to keep the heading and controls readable: a soft vignette with quiet top and bottom scrims, not a heavy darkening of the scene.
- Use fades for scene changes. Do not slide screens or animate layout properties.

### Calming interaction behavior

These follow attention-restoration and cognitive-load principles: let the natural scene do the work and keep the interface quiet.

- Rest the interface. After about five idle seconds, fade the heading and controls away so the scene fills the frame. Any pointer movement, tap, or key press brings them back. Keyboard focus always keeps them visible, and reduced-motion users keep them visible at all times.
- Let the heading breathe. "Take a breath." rises and settles on a slow, roughly eleven-second cycle that echoes a calm breathing pace. This is ambient only, never a timed instruction or guided exercise, and it stops under reduced-motion.
- Explain silence gently. If autoplay policy blocks sound, show one quiet, non-alarming hint inviting a tap to add the recording's sound, then let it fade. Never use a spinner, badge, or warning styling.

## 7. Scene selection

- The Another control must open a compact scene picker over the current video.
- Show a visual preview for each available scene.
- Mark the selected scene with `aria-pressed="true"`.
- Selecting a scene must close the picker and begin the scene change immediately.
- Crossfade between the old and new video with opacity and media volume.
- Load only the selected video and the video being prepared for the crossfade.
- Release the previous video source after the transition completes.
- Let users close the picker with its close control, the backdrop, or the Escape key.

## 8. Sharing

- The Share control must use the Web Share API when available.
- If Web Share is unavailable, copy the current app URL to the clipboard.
- When opened directly from a local file, copy `https://calmintherush.org` as the placeholder share URL.
- Sharing must start only after a user action.

## 9. Accessibility

- All interactive controls must be at least 44 by 44 px.
- Every icon-only control must have an accessible name.
- Keyboard users must be able to reach every control and see a focus indicator.
- The scene picker must expose dialog semantics and return focus when it closes.
- Status messages such as sound changes and copied links must be announced through a polite live region.
- When `prefers-reduced-motion: reduce` is active, pause video playback and show the current poster image.
- Maintain readable contrast for the heading, controls, and focus states.

## 10. Performance and offline behavior

- Store the HTML, video loops, and poster images in the project for the demo.
- Do not impose an arbitrary combined size cap. Size each clip for a clean-looking scene: gentle, low-detail footage (still water, a field) compresses small, while busy water or rain legitimately needs several MB. The current demo set totals roughly 25 MB.
- Encode demo video as portrait 720 by 1560 px, H.264, with AAC stereo audio.
- Show the local poster immediately and let the video stream in behind it, so the opening scene never blocks on a large download.
- Use opacity and transform for visual animation. Do not animate width, height, margin, padding, top, or left.
- Pause playback while the page is hidden and resume it when the page becomes visible.
- The core experience must remain usable without a network connection. If Google Fonts is unavailable, use the system font fallback.
- Do not show a loading spinner. Keep the poster visible until the selected video can play.

## 11. Privacy and project constraints

- Collect no personal data, analytics, behavioral events, or location information.
- Use no cookies, advertising scripts, trackers, account system, or remote API.
- Keep the demo in one `index.html` file with inline CSS and JavaScript.
- Use vanilla HTML, CSS, and JavaScript with no build step, framework, package manager, or runtime dependency.

## 12. Acceptance criteria

The demo is ready for review when all of the following pass:

1. Opening the file shows a nature video with "Take a breath." and three bottom controls.
2. Desktop displays a centered 9:19.5 surface, and mobile fills the viewport.
3. Each video plays the sound captured in that exact recording.
4. Sound starts by default when allowed, or starts on the first tap when autoplay is blocked.
5. The sound toggle turns the active video's sound on and off.
6. Another opens the scene picker, and selecting a scene changes picture and sound together.
7. The loop boundary has no abrupt picture cut or unrelated sound transition.
8. Share opens the device share sheet or copies the fallback URL.
9. Keyboard focus, Escape handling, accessible labels, and reduced-motion behavior work.
10. No custom audio, mismatched audio, questionnaire, affirmation, exercise, or progress UI appears.
