---
{"kind":"decision","id":"local-content-storage","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-18"}
---

# Keep experience content in the browser

## Decision

Use IndexedDB database `calm-in-the-rush-local-v4` with `experience`, `visitorUploads`, `oneLiner`, and `media` stores. The experience store holds ordered screens, tile definitions, breathing title and description, gateway links, and one-liner settings. The visitor upload store maps an upload tile to its selected local image. The one-liner store holds the optional visitor answer. The media store holds browser-local curated image blobs.

The browser falls back to the five bundled screens when it has no v4 configuration. The former v3 database is not read. Reset deletes both known databases and returns to the current bundled configuration.

A visitor image or one-liner never reaches a server and is removed with its containing tile, screen, or reset action when unreferenced. This is a same-browser demo boundary, not a publishing system. It has no cross-tab synchronization, revision state, migration, or compatibility layer.

## Constraint

Storage eviction, private mode, cleared site data, and reset can remove local screens, media, and the one-liner. The administration page displays local media storage, an estimated quota, and reset controls.
