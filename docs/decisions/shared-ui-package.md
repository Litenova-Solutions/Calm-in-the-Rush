---
{"kind":"decision","id":"shared-ui-package","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-07"}
---

# Share the experience UI package

## Decision

Place scene contracts in `@calm/content`, state and experience presentation in `@calm/experience`,
and the React Native Paper theme and public primitives in `@calm/ui`. Web and native are real
consumers, so the package boundary is warranted.

React Native Paper is the primary visual system for both frontend surfaces. Business behavior stays
in applications or the experience package. The UI package exports only documented entry points.

## Overrides

- `REPO.PACKAGES.001`: shared React packages are allowed because web and mobile consume them.
- `FRONTEND.PACKAGES.001`: cross-target experience code is allowed at the package boundary.
