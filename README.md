# Calm in the Rush

Calm in the Rush is a source-available nature break for web and mobile. Open a real place, stay as
long as you like, and leave without an account, streak, notification, analytics, cookie, or tracking
service. The current visual demo starts muted.

## Apps

- `apps/web`: Next.js landing page, requirements, demo, and browser-local admin.
- `apps/mobile`: Expo Router app for iOS, Android, and web.
- `packages/content`: Scene schema, seed catalog, media maps, and assets.
- `packages/experience`: Shared scene state and presentation.
- `packages/ui`: React Native Paper theme and project-owned primitives.

## Development

Node.js 24.16.0 and pnpm 11.13.1 are pinned.

```bash
pnpm install --frozen-lockfile
pnpm dev:web
```

Open `http://localhost:3200`. Use `pnpm dev:mobile` for the Expo app.

Run the repository checks with:

```bash
pnpm format:check
pnpm lint
pnpm type-check
pnpm test
pnpm docs:check
pnpm content:check
pnpm build
pnpm test:e2e
```

## Boundaries

The `/admin` route is a public demo route, not a security boundary. Scene metadata and uploaded
blobs stay in the current browser's IndexedDB. There is no API route, server action, account, cloud
storage, or remote content write.

Read the [product brief](docs/product/brief.md), [media provenance record](docs/research/media-provenance.md),
[privacy boundary](PRIVACY.md), [security policy](SECURITY.md), and [contribution guide](CONTRIBUTING.md)
before changing the project.

## License

This repository is source-available under [PolyForm Noncommercial 1.0.0](LICENSE). Third-party media
keeps its own license and attribution records.
