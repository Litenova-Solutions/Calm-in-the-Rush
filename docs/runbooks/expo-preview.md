# Expo preview note

Run `pnpm --filter @calm/mobile start` for a local Expo Router session. Development and preview EAS
profiles are included without a project ID, signing credentials, store submission, push notifications,
analytics, or remote updates. Run `expo-doctor` before a preview build and smoke-test scene playback,
sound activation, scene selection, sharing, safe-area layout, reduced motion, and screen-reader labels.
The repository command accepts only Expo Doctor's known same-version pnpm peer-path diagnostic after
the other checks pass; any other diagnostic is blocking.
