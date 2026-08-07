---
{"kind":"decision","id":"frontend-demo-profile","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-07"}
---

# Adopt the frontend demo standards profile

## Decision

Use the Engineering Standards repository, pinned at v1.9.0, for repository structure, frontend
accessibility, documentation, dependency review, and CI practices. This project selects a local
`frontend-demo` profile because it has no API, .NET solution, persistence, or server operations.

Next.js is the web frontend and Expo Router is the native frontend. Node 24.16.0 and pnpm 11.13.1
are pinned at the root. The web and native applications share packages only where both are consumers.

## Overrides

- `FRONTEND.STRUCTURE.001`: Expo Router is permitted beside Next.js.
- `DEP.PINS.001`: Expo, React Native Paper, IndexedDB, and cross-platform test packages use the pins in the root manifest.
- `DEP.APPROVAL.001`: These packages are approved for the demo and have no remote service access.

Expo Doctor can report same-version duplicate native peer paths when pnpm installs Expo Router
and React Native Paper peers in separate package contexts. The mobile doctor command tolerates only that
exact 19-of-20 diagnostic; all other Expo Doctor failures remain blocking.

## Rejected option

The full `dotnet-nextjs` profile is not claimed because this repository contains no API or .NET
solution. The local profile keeps the applicable frontend and repository checks visible.
