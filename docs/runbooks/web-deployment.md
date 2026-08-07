# Web deployment runbook

1. Create one Vercel project with root directory `apps/web`.
2. Install from the repository root with `pnpm install --frozen-lockfile`.
3. Set the build command to `pnpm --filter @calm/web build`.
4. Set `NEXT_PUBLIC_SITE_URL` to `https://calmintherush.org`.
5. Confirm `/`, `/requirements`, and `/demo` are indexed, and `/admin` is excluded.
6. Confirm bundled media uses cache headers without immutable file names.
7. Run `pnpm verify` before accepting a deployment.

The administration route shares the web origin so its IndexedDB namespace matches `/demo`.
