---
{"kind":"use-case","id":"calm.choose-scene","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-14","operationType":"command","actors":["person"],"entryPoints":["web-demo"],"risks":["availability"],"applicableExtensions":[]}
---

# Choose a gallery tile

## Trigger

A person selects the gallery icon in the phone frame.

## Rules

- Show the current local gallery page in the phone frame and let the person move to the previous or
  next page with labelled bottom actions. The compact floating header shows the page title and count,
  not the page description. Each page action shows its destination title and a directional icon.
- The nature page starts with four bundled videos, one bundled image, and seven ordered upload spaces.
- The quiet-moments page starts with five bundled human-activity images and seven ordered upload
  spaces.
- The your-people page starts with one centered `Add a nice photo or video of yourself and/or people
  you love` control and has six ordered upload spaces.
- Visible tiles fill the full gallery surface behind matching translucent floating close, title, count,
  and page-navigation controls. Their shared subtle edge keeps both bars legible. The empty
  your-people page uses a muted surface behind the floating controls and centered upload action. Only
  the first empty upload space on a page is visible. Selecting an image or video file fills that space,
  reveals the next upload space, and reduces the tile size if a new grid row is needed. An
  administrator can set any tile count. Pages with more than 12 visible tiles scroll within the full
  gallery surface so tiles remain usable. A configured page with no tiles shows an empty-state message.
- Moving between pages uses a short directional fade and movement when reduced motion is not requested.
- A bundled or uploaded tile becomes the selected image or video. A video loops with motion and a
  deliberate selection requests sound playback.
- The upload control accepts image and video files. It keeps each accepted file in the current
  browser's IndexedDB and reports a recoverable error for an unreadable or invalid file.
- The selected upload uses the original file name as alternative text.
