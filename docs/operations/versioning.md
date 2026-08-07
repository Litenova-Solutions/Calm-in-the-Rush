---
{"kind":"operating-procedure","id":"versioning","specStatus":"approved","implementationStatus":"planned","owner":"Product and engineering","lastReviewed":"2026-08-07","releaseRole":"repository","applicableExtensions":[]}
---

# Versioning

The repository uses Semantic Versioning. `VERSION` is the canonical release value and starts at
`0.1.0` for this demo.

Every workspace package keeps the same version as `VERSION`. Run `pnpm version:check` after a
version edit. A release change updates `VERSION`, all workspace package manifests, and the matching
section in `CHANGELOG.md` in one pull request.

Release tags use the `v` prefix, for example `v0.1.0`. Tag creation and deployment remain manual;
the repository does not publish packages or create releases automatically.
