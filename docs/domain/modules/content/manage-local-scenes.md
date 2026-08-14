---
{"kind":"use-case","id":"content.manage-local-scenes","specStatus":"approved","implementationStatus":"implemented","owner":"Product and engineering","lastReviewed":"2026-08-14","operationType":"command","actors":["person"],"entryPoints":["web-admin"],"risks":["irreversible","availability"],"applicableExtensions":[]}
---

# Manage local gallery

## Trigger

A person opens `/admin` in a browser.

## Rules

- The route has no authentication and is not a security boundary.
- An admin can add, name, remove, and reorder gallery pages. At least one page remains.
- Administration separates gallery, sentences, and local data with an in-page section switcher.
- The gallery section is one in-context editor: page names, ordered tiles, page actions, and add-page
  controls live in the same tree.
- An admin can add or remove active-media sentences. At least one sentence remains and the gallery
  contains no more than 24.
- A nested gallery tree shows pages and their tiles. An admin can drag a tile to reorder it or move it
  to another page. A named Move action opens the destination-page choices, while directional controls
  change order within the current page. An admin adds either a visitor-upload tile or pre-filled image
  or video from the page's Add tile action, then edits that tile from its row. A page can have zero or
  more tiles; its tile count defines the visitor-visible capacity.
- Moving an upload tile to another page keeps its browser-local uploaded media associated with that
  tile.
- A pre-filled tile accepts image and video files. Its file and metadata stay in the current browser's
  IndexedDB and can be replaced without changing the tile's order.
- The gallery configuration, visitor uploads, and local pre-filled media stay in the current browser's
  IndexedDB.
- The local-data section shows used media storage, estimated quota, reset control, and recovery text
  for invalid media, quota errors, and write failures. It does not embed a phone preview.
- Reset removes the v3 local database and restores the bundled three-page gallery.
- There is no server write path, cross-tab synchronization, migration, or compatibility layer.
