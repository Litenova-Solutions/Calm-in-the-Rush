---
{"kind":"product","id":"calm-in-the-rush","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-18","primaryReleaseFlow":"find-a-calm-moment"}
---

# Calm in the Rush product brief

## Purpose

Calm in the Rush is a phone-framed web experience for a short pause. It has no account, timer, streak, server, remote content service, analytics, cookies, or sharing feature.

## Primary flow: find-a-calm-moment

1. A person opens `/` or `/demo` and sees the Nature opening cover: the first configured Nature tile, with its assigned sentence.
2. They select `See More` and see a quiet two-column grid of three bundled Nature photographs and one visible local upload tile.
3. They continue to Quiet Moments, which uses the same two-column layout with three bundled photographs and one visible local upload tile.
4. They continue to Friendly Faces, which always offers two independent local uploads: one relaxed photograph of themselves and one friendly or relaxed photograph of someone else.
5. They continue to Take a Breath for a repeating slow visual cue without playback controls, phase labels, timers, or links.
6. They continue to the RUST gateway, where the supplied RUST logo and links to the RUST website and Vrienden van RUST appear.
7. On the final RUST gateway page, they can write a short local answer to `What does calm mean to you, and/or how do you make time for it? Keep it short.`, then later edit or clear it there.

## Use cases

| ID | Use case | Status | Specification |
| :-- | :-- | :-- | :-- |
| UC-CALM-001 | View the experience | implemented | [view experience](../domain/modules/calm/view-experience.md) |
| UC-CALM-002 | Add a local photograph | implemented | [add a photo](../domain/modules/calm/add-photo.md) |
| UC-CALM-003 | Save a calm one-liner | implemented | [save a one-liner](../domain/modules/calm/save-one-liner.md) |
| UC-CONTENT-001 | Manage local experience content | implemented | [manage local experience](../domain/modules/content/manage-local-experience.md) |

## Page requirements

| Page | Purpose | Status | Specification |
| :-- | :-- | :-- | :-- |
| `/` | Run the phone-framed experience | implemented | [root demo](../ui/landing.md) |
| `/demo` | Render the same experience at its direct URL | implemented | [demo](../ui/demo.md) |
| `/admin` | Edit the local experience in the current browser | implemented | [admin](../ui/admin.md) |

## Visitor experience

- The root route has no splash screen, public header, hero copy, footer, or visitor action group. A small Admin link remains outside the phone frame.
- Nature opens on the first configured pre-filled tile. Its seeded cover is a green mountain meadow with the assigned sentence `Take a breath.`. The sentence is larger, non-bold, softly translucent, edge-aligned, and moves by a small amount. A transparent bottom navigation bar contains only the forward `See More` action. Selecting it hides the cover by default and shows three other bundled photographs plus one upload tile in a borderless, gap-free two-column grid.
- Gallery screens have no visible title, subtext, captions, card treatment, or tile gaps. Their tiles fill the phone screen behind the transparent page navigation. Empty upload tiles retain their administrator-configured label and short guidance sentence. Administrators retain a sentence for each tile so a specific sentence stays associated with its image when the tile is made the opening cover. The visitor cannot select from a shared sentence bank.
- Quiet Moments has three bundled photographs and one upload tile. Friendly Faces has two upload tiles, and neither is hidden after the other receives a photograph.
- Upload tiles accept JPEG, PNG, WebP, and AVIF images only. Invalid or unreadable files show a recoverable message and do not replace a tile.
- Take a Breath uses a code-native SVG visual, not an embedded or generated video. A glowing yellow-orange orb moves across a smooth blue sine wave on a blue-white background in a fixed twelve-second loop. It shows only its title, short description, and visual cue.
- The RUST gateway shows the existing supplied logo. It links to `https://rustindereuring.nl/` and `https://rustindereuring.nl/mensen-die-rust-belangrijk-vinden/`.
- The final RUST gateway page has an optional one-liner prompt and large multi-line input, separated from the RUST links by a divider. The answer stays in the current browser and can be changed or cleared.
- The phone interface uses visible focus styles, labelled controls, status messages for recoverable errors, a heading focus target after page navigation, and no animation when reduced motion is requested.

## Local content and administration

The browser owns one experience configuration, visitor image uploads, an optional one-liner, and locally curated media blobs. IndexedDB database `calm-in-the-rush-local-v4` has `experience`, `visitorUploads`, `oneLiner`, and `media` stores. The older v3 database is deleted during reset and is not read.

An administrator can create, edit, duplicate, remove, and reorder screens. A screen is a Gallery, Breathing, or RUST gateway screen. Gallery screens have ordered pre-filled and upload tiles. The first pre-filled tile of the first Gallery screen can act as the opening cover and can be repeated or hidden from its grid.

An administrator assigns a title, alternative text, image, and sentence to every pre-filled tile. They assign a visible label and sentence to every upload tile. They can add, edit, remove, and reorder tiles, edit a breathing title and description, edit RUST gateway links, and edit the final-page one-liner prompt and placeholder. The default configuration has five screens, but local administration may temporarily contain zero screens.

All local content stays in the browser that created it. Removing a screen or tile removes unreferenced local media. Reset removes v4 and the known v3 database, then restores the bundled five-screen experience. There is no sign-in, server write path, remote upload, cross-tab synchronization, migration, or compatibility layer.

## Media, performance, and provenance

The Nature cover and three Nature gallery photographs are stakeholder-supplied Unsplash downloads. The three Quiet Moments photographs are generated for this app. All seven are converted to 1024 by 1536 WebP files, metadata stripped, and stored under `apps/web/public/media/experience`. The opening cover is 243 KB. The six gallery photographs range from 63 KB to 296 KB. The browser preloads only the opening cover; later bundled images lazy-load when their active screen renders. Browser-local uploads use native image elements because a blob URL is not a static bundled asset.

The media provenance record identifies each photographer or prompt, source location, output SHA-256 hash, WebP encoding, and license basis. The existing supplied RUST SVG logo and its source record remain intact.

## Privacy and constraints

Calm in the Rush sends no visitor configuration, image, one-liner, or local media to a server. Private browsing, storage eviction, cleared site data, and reset can erase browser-local data.

No unit, integration, or QA test suite is added for this implementation. Verification consists of formatting, lint, type checking, documentation checks, production build, and direct browser checks of `/`, `/demo`, and `/admin`.

Do not add authentication, an API route, a server action, a database, remote content, analytics, cookies, share controls, server uploads, or a hosted media bank without an explicit product decision.
