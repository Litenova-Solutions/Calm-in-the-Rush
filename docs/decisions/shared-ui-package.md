---
{"kind":"decision","id":"shared-ui-package","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-07"}
---

# Share the experience UI package

## Decision

Place scene contracts in `@calm/content`, state and experience presentation in `@calm/experience`,
and tokens and small primitives in `@calm/ui`. Web and native are real consumers, so the package
boundary is warranted.

Tamagui replaces per-application shadcn/ui. Business behavior stays in applications or the experience
package. The UI package exports only documented entry points.

## Overrides

- `REPO.PACKAGES.001`: shared React packages are allowed because web and mobile consume them.
- `FRONTEND.PACKAGES.001`: cross-target experience code is allowed at the package boundary.
- `UI.SHADCN.001`: Tamagui owns the shared primitives and tokens.
