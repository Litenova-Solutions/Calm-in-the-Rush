# Changelog

## Unreleased

- Adopted Engineering Standards v1.10.0 and rebuilt the web frontend on the controlled shadcn/ui
  baseline: Base UI primitives, Tailwind CSS v4, the Vega style, neutral semantic tokens, Geist, and
  Lucide. `apps/web` owns its generated source, `components.json`, one global CSS entry, `lib/utils.ts`,
  and `ui-source-lock.json`. Ungoverned CSS dropped from 742 lines to 150.
- Split the shared UI boundary. `@calm/experience` is behavior only and exports the
  `useCalmExperience` model with no visual imports; the web frontend renders it with shadcn/ui and the
  native frontend renders it with Paper through `@calm/ui`, which is now native-only. Neither frontend
  shares a runtime component library with the other.
- Added the web UI contract: `docs/ui/web/vocabulary.json` plus a page sidecar for the landing,
  requirements, demo, and administration routes, all validated by `standards/tools/validate-ui.mjs`.
  Removed the bespoke `scripts/validate-ui-governance.mjs` in favor of the standards validator.
- Forked the generated `Table` primitive to give its horizontal scroll region keyboard access and an
  accessible name, recorded with reason, scope, owner, review triggers, and evidence.
- Simplified the local administration form to a title and one MP4. The cover is now derived from the
  first frame of the uploaded video, the file is validated when it is chosen, and destructive actions
  confirm in a dialog rather than a native browser prompt.
- Made `attribution.sourceUrl` optional so a locally uploaded scene records honest local provenance
  instead of an invented source URL.
- Replaced the landing hero with a phone-framed still of the demo, carrying the same scrim and wording
  as the live stage. The photograph is the Milky Way over Oeschinensee by Giles Laurent, CC BY-SA 4.0,
  from Wikimedia Commons, with a license sidecar and visible credit. Linked the credits page from the
  footer so attribution for every licensed asset is reachable.
- Made the browser gate real: the Playwright suite starts its own server by default instead of skipping
  itself and reporting success, and it declares a fixed worker count with no retries. Coverage grew to
  65 tests across three engines at wide and compact viewports, including initial scroll and focus, tab
  order, dialog focus return, labelling, destructive confirmation, validation reporting, and axe checks.
- Updated the toolchain to the versions the standards pin: Next.js 16.3.0, ESLint 10.8.1,
  `@types/node` 26.2.0, Prettier 3.9.6, and the current Expo SDK 57 patch set. TypeScript stays on 6.0.3
  because typescript-eslint has no TypeScript 7 support yet, and React stays on 19.2.3 because Expo
  SDK 57 pins it.
- Set the initial repository version to `0.1.0` and documented the release process.
- Rebuilt the demo as a pnpm monorepo with web, native, shared content, UI, and experience packages.
