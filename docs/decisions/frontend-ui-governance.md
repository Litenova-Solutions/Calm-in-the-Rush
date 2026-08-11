---
{"kind":"decision","id":"frontend-ui-governance","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-11"}
---

# Govern the frontend UI system

## Decision

Each frontend uses the visual system that its platform standard selects, and neither frontend shares a
runtime component library with the other.

The web frontend uses the Engineering Standards controlled baseline: shadcn/ui with Tailwind CSS v4,
Base UI primitives, the Vega style, CSS variables, neutral tokens, Geist, and Lucide, at the versions
`standards.manifest.json` pins. `apps/web` owns its generated source under `components/ui/`, its
`components.json`, its one global CSS entry, `lib/utils.ts`, and `ui-source-lock.json`. Route and
feature code composes `@/components/ui` and never imports a primitive base directly.

The native frontend keeps React Native Paper as its platform system, rendered through
`@calm/ui`. Official shadcn/ui components are DOM-oriented React source and are not a React Native
component system, so the native platform decision stays separate. `@calm/ui` is native-only: the web
frontend does not import it, and it no longer carries a `react-native-web` shim for web consumption.

## Shared behavior, separate rendering

`@calm/experience` is behavior only. It exports `useCalmExperience`, which owns scene selection,
control visibility, player failure, and share state, plus the player and media types and a
platform-resolved `useReducedMotion`. It imports no visual system.

Each frontend renders that model with its own vocabulary: `apps/web/app/components/WebExperience.tsx`
uses shadcn primitives and Tailwind tokens, and `apps/mobile/components/CalmExperience.tsx` uses Paper.
This is the behavior-companion boundary the standards prescribe: one visual authority per frontend, with
shared state underneath.

## Web UI contract

`docs/ui/web/vocabulary.json` is the closed construction language for the web frontend: its profile is
`public-light`, with `public-shell/default`, `stage-shell/default`, and a named `admin-shell/default`
secondary shell for the administration route. It records every shell, pattern, installed component,
semantic token, applicable state, fork, runtime style, and evidence record. Each visible route has a
sidecar beside its page document.

One component is forked. The generated `Table` container is a horizontally scrollable region with no
keyboard access and no accessible name, which axe reports as a serious violation on the requirements
page. The fork adds a focusable, named region and is recorded with its reason, scope, owner, review
triggers, and evidence.

One runtime style exemption is recorded. `app/opengraph-image.tsx` renders through Next.js
`ImageResponse`, which has no class support, so inline style is its only styling API and it emits a PNG
rather than DOM.

## Enforcement

`node standards/tools/validate-ui.mjs` validates the frontend UI configuration, the vocabulary, the page
sidecars, the source-lock digests, the global CSS surface, and the class strings in feature code. The web
ESLint configuration rejects React Native, `@calm/ui`, and primitive-base imports. Playwright covers the
landing, requirements, demo, and admin routes across three engines at wide and compact viewports,
including initial scroll and focus, tab order, dialog focus return, labelling, destructive confirmation,
validation reporting, and axe checks.

## Constraints

Visual comparison baselines and a manual screen-reader, zoom, and contrast session are not established.
Both are recorded as waived evidence in the vocabulary with the condition for lifting the waiver. The
library does not replace semantic route composition, browser storage, media playback, or Next.js
navigation; those stay in the owning application and compose the approved UI exports.
