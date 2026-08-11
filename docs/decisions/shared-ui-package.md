---
{"kind":"decision","id":"shared-ui-package","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-11"}
---

# Share the experience packages

## Decision

Place scene contracts in `@calm/content`, experience behavior in `@calm/experience`, and the React
Native Paper theme and native primitives in `@calm/ui`.

`@calm/content` and `@calm/experience` have two real consumers, so their package boundary is warranted.
`@calm/experience` is behavior only: it exports the `useCalmExperience` model, the player and media
types, and a platform-resolved `useReducedMotion`. It imports no visual system, so it cannot become a
second visual authority.

`@calm/ui` has one consumer, the native application, and is the native platform system. Keeping it a
package rather than folding it into `apps/mobile` preserves its own type-check and test boundary and
keeps the native theme reviewable on its own. It is not shared with the web frontend.

Each frontend owns its rendering of the shared model. The web frontend renders it with shadcn/ui in
`apps/web/app/components/WebExperience.tsx`; the native frontend renders it with Paper in
`apps/mobile/components/CalmExperience.tsx`. See
[the frontend UI governance decision](frontend-ui-governance.md).

## Overrides

- `REPO.PACKAGES.001`: shared React packages are allowed because web and mobile consume the content and
  behavior packages.
- `FRONTEND.PACKAGES.001`: cross-target behavior code is allowed at the package boundary. Cross-target
  presentation is not; each application renders its own.
