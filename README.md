# Calm in the Rush

Calm in the Rush is a source-available reflection experience: a native Android app and a web demo that installs as a web app. The web demo opens on a calm photo or video with its own sound and sentence. From there a visitor can pick another photo from a gallery of topics, add their own photos, follow a breathing cue, and say how calm they feel. Neither app has an account, streak, notification, analytics, cookie, or tracking service.

## Apps

- `apps/mobile`: the native Android app, built with .NET for Android, and the plain .NET core it shares with later apps.
- `apps/web`: the Next.js web demo, installable as a web app on phones.

## Development

Node.js 24.16.0 and pnpm 11.13.1 are pinned.

```bash
pnpm install --frozen-lockfile
pnpm dev:web
```

Open `http://localhost:3200`.

The Android app needs the .NET 10 SDK with the `android` workload and an Android SDK with API 36:

```bash
dotnet workload install android
dotnet build apps/mobile/CalmInTheRush.Mobile.slnx
dotnet build apps/mobile/src/CalmInTheRush.Android -t:Run
```

Run the repository checks with:

```bash
pnpm format:check
pnpm lint
pnpm type-check
pnpm build
```

## Boundaries

The Android app keeps visitor photos and the one-liner in its private storage and makes no network call. The web demo's content is built into the code; visitor photos and feedback stay in the current browser's storage. There is no API route, server action, account, cloud storage, or remote content write.

The project follows LiteSpec 3.0.0 with the `android` stack; `AGENTS.md` names the selection and its
deviations. Read the [privacy boundary](PRIVACY.md), [security policy](SECURITY.md), and
[contribution guide](CONTRIBUTING.md) before changing the project.

## License

This repository is source-available under [PolyForm Noncommercial 1.0.0](LICENSE). Generated media and the supplied RUST logo retain their provenance records.
