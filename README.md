# Calm in the Rush

Calm in the Rush is a source-available web demo with a phone-framed image and video gallery. The root
route opens without an account, streak, notification, analytics, cookie, or tracking service.

## Apps

- `apps/web`: Next.js phone-framed gallery demo and browser-local admin.
- `packages/config`: Shared lint configuration.

## Development

Node.js 24.16.0 and pnpm 11.13.1 are pinned.

```bash
pnpm install --frozen-lockfile
pnpm dev:web
```

Open `http://localhost:3200`.

Run the repository checks with:

```bash
pnpm format:check
pnpm lint
pnpm type-check
pnpm docs:check
pnpm build
```

## Boundaries

The `/admin` route is a public demo route, not a security boundary. Gallery configuration and local
media blobs stay in the current browser's IndexedDB. There is no API route, server action, account,
cloud storage, or remote content write.

Read the [product brief](docs/product/brief.md), [media provenance record](docs/research/media-provenance.md),
[privacy boundary](PRIVACY.md), [security policy](SECURITY.md), and [contribution guide](CONTRIBUTING.md)
before changing the project.

## License

This repository is source-available under [PolyForm Noncommercial 1.0.0](LICENSE). Third-party media
keeps its own license and attribution records.
