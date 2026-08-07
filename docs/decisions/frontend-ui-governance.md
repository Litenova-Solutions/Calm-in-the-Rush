---
{"kind":"decision","id":"frontend-ui-governance","specStatus":"approved","owner":"Product and engineering","lastReviewed":"2026-08-07"}
---

# Govern the frontend UI system

## Decision

Use React Native Paper 5.15.3 as the primary component and styling system for the web and native
frontend surfaces. React Native Paper renders through `react-native-web` on the web and uses the
same Material Design 3 theme on native platforms.

`@calm/ui` owns the Paper provider, theme tokens, icons, brand mark, layout primitives, and public
component wrappers. Route and feature code imports visual components only from the `@calm/ui` root
entry point. Direct imports from `react-native-paper`, `react-native`, `lucide-react-native`, and
package-internal paths are prohibited outside that package.

The public inventory includes `CalmProvider`, `ActivityIndicator`, `Badge`, `Box`, `Button`,
`ButtonLink`, `Card`, `CheckboxField`, `Divider`, `FileInput`, `Field`, `IconButton`, `Image`,
`Link`, `PaperDialog`, `PaperText`, `Portal`, `Screen`, `Scroll`, `SelectField`, `Sheet`, `Stack`,
`StatusMessage`, `Surface`, `TextInput`, `Touchable`, and `CalmMark`. Visual changes use the
declared Paper theme roles and layout token variants. Media elements remain in the experience
boundary because Paper does not own video playback. The experience boundary may use React Native
layout, media, and platform-share primitives for the shared experience, but its buttons, text, image
tiles, modal sheet, and icons come from `@calm/ui`. The native player may use React Native's media
view style because Expo Video owns that platform surface.

## Enforcement

The web ESLint configuration rejects direct visual-library imports outside `@calm/ui`. A repository
check rejects Tamagui references, package-internal UI imports, and raw visual literals in web source.
Paper component tests cover the theme and public inventory. Playwright covers the required routes,
keyboard-visible controls, and accessibility checks.

## Constraints

The library does not replace semantic route composition, browser storage, media playback, or Next.js
navigation. Those responsibilities remain in the owning application or experience package and must
compose the approved UI exports.
