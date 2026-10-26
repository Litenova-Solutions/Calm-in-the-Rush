---
{
  "type": "decision",
  "id": "decision/0001-native-android-app-with-dotnet",
  "title": "Build the Android App Natively with .NET for Android",
  "owner": "A. Shafie",
  "status": "draft",
  "decider": "A. Shafie",
  "decideBy": "2026-11-09",
  "options": [
    {
      "name": ".NET for Android",
      "for": "Plain Android views and media APIs from C#, with no framework layer between the app and the platform, and a platform-free C# core a later iOS app and a .NET backend can share.",
      "against": "UIKit and Android views instead of SwiftUI and Jetpack Compose, two UI codebases once iOS follows, and thinner .NET-specific documentation."
    },
    {
      "name": ".NET MAUI",
      "for": "One shared UI codebase in C# for Android and iOS.",
      "against": "Its full-bleed media, safe-area and gesture handling saw repeated regressions in the .NET 10 cycle, and those are exactly the screens this product is built from."
    },
    {
      "name": "Kotlin with Jetpack Compose",
      "for": "The most current Android toolkit and the widest documentation.",
      "against": "A language the owner does not work in daily, and no code shared with a .NET backend."
    },
    {
      "name": "A WebView or React Native shell around the web demo",
      "for": "Reuses the web demo almost unchanged.",
      "against": "The owner ruled out web views and React for the mobile apps; the experience would not feel native."
    }
  ],
  "changeWhen": "The app needs more than a handful of form-style screens that a shared UI layer would save, or the iOS app is about to start and two UI codebases cost more than the media screens gain."
}
---
# Build the Android App Natively with .NET for Android

## Context

The web demo in `apps/web` shows the visitor flow in a phone frame. The product needs real mobile apps, and the owner asked for a native experience without web views or React, written in C#. The flow is media-first: full-bleed looping video with ambient sound, paging through photo galleries, a breathing animation, a system photo picker, and private storage on the device. A .NET backend and API are planned but not part of this step.

## Decision

Build the Android app with .NET for Android and plain Android views, in a mobile solution at `apps/mobile/` whose Domain, Application, and Infrastructure projects target plain .NET so an iOS app and the planned backend can share them. Recreate the web demo's visitor flow first; the iOS app follows as a separate step.

## Consequences

Each platform gets its own screens, written against the platform's own toolkit. The media screens use the platform players directly, so a framework regression cannot break them. Content, rules, and storage live once in the core projects. The app follows the LiteSpec `android` stack.
