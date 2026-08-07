# Calm in the Rush

[![CI](https://github.com/Litenova-Solutions/Calm-in-the-Rush/actions/workflows/ci.yml/badge.svg)](https://github.com/Litenova-Solutions/Calm-in-the-Rush/actions/workflows/ci.yml)
[![PolyForm Noncommercial](https://img.shields.io/badge/license-PolyForm%20Noncommercial-10252B)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.2-10252B)](apps/web/package.json)
[![Expo SDK 57](https://img.shields.io/badge/Expo-SDK%2057-10252B)](apps/mobile/app.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-10252B)](tsconfig.json)

Calm in the Rush is a source-available, privacy-first nature break for web and mobile. Open a real
place, stay as long as you like, and leave without an account, streak, notification, analytics,
cookie, or tracking service. Bundled clips retain their ambient audio for a planned sound
activation interaction; the current visual demo starts muted.

The deployed demo is intended to live at [calmintherush.org](https://calmintherush.org). The local
administration page stores edits in the current browser only. It does not publish content to another
browser or device.

![Landing page desktop screenshot](docs/screenshots/landing-desktop.jpg)
![Calm demo mobile screenshot](docs/screenshots/demo-mobile.jpg)

The repository social preview artwork is in `docs/screenshots/social-preview.png` with its SVG source.

## Features

- Landing page with four attributed nature scenes.
- Public product brief at `/requirements`.
- Mobile-shaped browser demo at `/demo` with image-led scene picking, muted playback, sharing, and reduced-motion poster behavior.
- Local-only catalog editor at `/admin` with IndexedDB storage, file validation, draft and published states, ordering, quota display, and reset.
- Expo Router application for iOS, Android, and web using the same scene contracts, tokens, and experience state.
- Media provenance and license records beside every binary asset.

## Repository map

```text
apps/web       Next.js landing, requirements, demo, and local admin
apps/mobile    Expo Router application
packages/config       Shared lint and test configuration
packages/content      Scene schema, seed catalog, media maps, and assets
packages/experience   Calm experience state and presentation
packages/ui           React Native Paper theme and project-owned primitives
docs                 Product, domain, UI, decisions, operations, and research records
standards            Engineering Standards v1.9.0 submodule
scripts              Media sync and repository validators
```

## Local setup

Node.js 24.16.0 and pnpm 11.13.1 are pinned. Clone the standards submodule with the repository:

```bash
git clone --recurse-submodules https://github.com/Litenova-Solutions/Calm-in-the-Rush.git
cd Calm-in-the-Rush
pnpm install --frozen-lockfile
pnpm dev:web
```

Open `http://localhost:3200`. Use `pnpm dev:mobile` for Expo Router. The required checks are:

```bash
pnpm format:check
pnpm lint
pnpm type-check
pnpm test
pnpm docs:check
pnpm content:check
pnpm build
pnpm test:e2e
pnpm verify
```

## Administration boundary

`/admin` is a public demo route and is not a security boundary. It stores scene metadata and uploaded
blobs in IndexedDB named `calm-in-the-rush-demo`. A browser reset, private browsing session, storage
eviction, or cleared site data may remove changes. No API route, server action, account, cloud storage,
or remote content service is included.

## Architecture decisions

The repository follows the pinned Engineering Standards submodule with a local `frontend-demo` profile.
Next.js and Expo Router are separate deployables. Shared contracts and real cross-target consumers live
in packages. React Native Paper owns the shared component system and `@calm/ui` owns its theme and
public wrappers. PolyForm Noncommercial 1.0.0 covers repository
software, while third-party media keeps its own license.

Read the [product brief](docs/product/brief.md), [media provenance record](docs/research/media-provenance.md),
[privacy boundary](PRIVACY.md), [security policy](SECURITY.md), [AI policy](AI_POLICY.md), and
[contribution guide](CONTRIBUTING.md) before changing the project.

## Media credits

- Lake: National Park Service and Jacob W. Frank through GlacierNPS, United States government public-domain basis.
- Forest: Fredrik Johansson and Sounds of Changes, CC BY 3.0.
- Wheat field: Coup 53, CC BY 3.0, with a license-review-needed flag on the Commons page.
- Brook: Poojilsharma07, CC BY-SA 4.0.

Adaptation details and source links are in `THIRD_PARTY_NOTICES.md` and each adjacent `.license` file.

## License

This is source-available software under [PolyForm Noncommercial 1.0.0](LICENSE). It is not described
as OSI open source because commercial use is restricted.
