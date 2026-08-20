# Media provenance

## Scope and license basis

The seven WebP photographs under `apps/web/public/media/experience` have two sources. The four Nature photographs were supplied to the project by the stakeholder as downloaded Unsplash images. The three Quiet Moments photographs were generated with OpenAI image generation on 2026-08-18. The people in the Quiet Moments photographs were requested as fictional, non-identifiable adults.

The Nature photographs are used under the [Unsplash License](https://unsplash.com/license). Their repository copies are derived from the stakeholder-supplied source JPEGs listed below. The Quiet Moments photographs are covered by OpenAI's [Terms of Use](https://openai.com/policies/terms-of-use/), which state in the `Ownership of content` section that, as between the user and OpenAI and to the extent permitted by applicable law, the user owns the output and OpenAI assigns any right, title, and interest in that output. The terms were published and effective 2026-01-01 and were reviewed for this record on 2026-08-18.

All repository copies are 1024 by 1536 WebP files encoded with FFmpeg libwebp using the photo preset. Metadata is stripped. The four Nature files use quality 82. The Quiet Moments files retain their earlier quality 80 encoding.

## Asset records

| Repository asset | Source | Size | SHA-256 |
| :-- | :-- | --: | :-- |
| `cover-meadow.webp` | Stakeholder supplied [T Y Unsplash photograph](https://unsplash.com/photos/J2uijPfEjrA), `C:\Users\a.shafie\OneDrive - Netmatch\Pictures\Calm in the Rush\t-y-J2uijPfEjrA-unsplash.jpg` | 243,054 bytes | `faeab1db9c897f9270501e071d6cd2e883a4be01470d9f3f74cc7d1f189f2ac7` |
| `nature-dunes.webp` | Stakeholder supplied [Hardial Aujla Unsplash photograph](https://unsplash.com/photos/f4RLa2oDK04), `C:\Users\a.shafie\OneDrive - Netmatch\Pictures\Calm in the Rush\hardial-aujla-f4RLa2oDK04-unsplash.jpg` | 295,516 bytes | `1148c74bc658211117485efc1f7e98bcc9fcf5e81a0168f0d92908c6ce578d0d` |
| `nature-forest.webp` | Stakeholder supplied [Matteo Confetti Unsplash photograph](https://unsplash.com/photos/W3zrwOgyz1s), `C:\Users\a.shafie\OneDrive - Netmatch\Pictures\Calm in the Rush\matteo-confetti-W3zrwOgyz1s-unsplash.jpg` | 118,550 bytes | `ba02b3bdaa00077294bd8c4f4082f350af74acca6cec4695b5b813f75d6d95f0` |
| `nature-brook.webp` | Stakeholder supplied [Dominik Mattern Unsplash photograph](https://unsplash.com/photos/i1IiI638vlI), `C:\Users\a.shafie\OneDrive - Netmatch\Pictures\Calm in the Rush\dominik-mattern-i1IiI638vlI-unsplash.jpg` | 200,264 bytes | `97c2a68024c616420ac7611eccaea34910110f5a7244a14187a72c42844586e4` |
| `quiet-city-reading.webp` | `C:\Users\a.shafie\.codex\generated_images\01a01522-2dfd-73e2-ba10-b9359c25a255\exec-c9f34215-0f79-4ffd-aa4d-6aa6e3ad3799.png` | 142,210 bytes | `52fcc6d4eb2c25d91277ac5e23d7467128d8e26c15acadb75ee9153f98872a8e` |
| `quiet-window-tea.webp` | `C:\Users\a.shafie\.codex\generated_images\01a01522-2dfd-73e2-ba10-b9359c25a255\exec-77022c6f-2944-4a40-8ef5-5b70771b26e8.png` | 63,312 bytes | `2828ed872fd43b901e2470ebcf193f3af7801bf7c30ae59c0a2d49b427b7eec8` |
| `quiet-balcony-garden.webp` | `C:\Users\a.shafie\.codex\generated_images\01a01522-2dfd-73e2-ba10-b9359c25a255\exec-3a237a10-8425-4a2c-87c4-cbc52bcf27ef.png` | 125,988 bytes | `205586e344c408b02c2930e595987c9ce77a631552780db3b9d03b38e5cca8b7` |

## Generator prompts

### quiet-city-reading.webp

```text
Use case: photorealistic-natural
Asset type: portrait Quiet Moments gallery image for a calm reflection web app
Primary request: a fictional middle-aged adult reading a paperback book calmly while a busy European city moves around them
Scene/backdrop: public city square or broad sidewalk, passing pedestrians are softly motion-blurred and unidentifiable
Subject: one relaxed reader seated naturally, neutral modest clothing, looking down at the book, face visible but not a real person
Style/medium: photorealistic candid editorial street photography
Composition/framing: vertical 2:3 portrait composition, reader centered in lower two-thirds, background people remain vague and non-identifiable
Lighting/mood: gentle daylight, contemplative calm within urban movement
Color palette: muted warm gray, sage, soft neutral skin tones
Materials/textures: real fabric, paper, pavement, natural city detail
Constraints: no text, no logos, no watermark, no readable shop signs, no identifiable real people
Avoid: glamor pose, exaggerated motion streaks, busy visual clutter, stock-photo polish
```

### quiet-window-tea.webp

```text
Use case: photorealistic-natural
Asset type: portrait Quiet Moments gallery image for a calm reflection web app
Primary request: a fictional adult woman holding a warm cup of tea by a rain-speckled apartment window
Scene/backdrop: simple quiet home interior with a soft out-of-focus view of rain outside
Subject: relaxed seated person in comfortable neutral clothing, natural hands around a ceramic mug, calm thoughtful posture
Style/medium: photorealistic candid editorial lifestyle photography
Composition/framing: vertical 2:3 portrait composition, three-quarter view, natural window light, face not posed toward camera
Lighting/mood: soft gray daylight with warm indoor highlights, private and restful
Color palette: muted sage, warm cream, soft charcoal
Materials/textures: rain on glass, knit fabric, ceramic, real wood or painted window frame
Constraints: no text, no logos, no watermark, no visible brand, fictional person only
Avoid: fashion editorial pose, heavy retouching, overly dark scene, exaggerated sadness
```

### quiet-balcony-garden.webp

```text
Use case: photorealistic-natural
Asset type: portrait Quiet Moments gallery image for a calm reflection web app
Primary request: a fictional older adult calmly tending small herb plants on an urban balcony
Scene/backdrop: modest European apartment balcony with a soft city view in the distance, no readable signs
Subject: relaxed person in practical casual clothing, natural hands touching rosemary or mint in simple pots, face visible but not posed
Style/medium: photorealistic candid editorial lifestyle photography
Composition/framing: vertical 2:3 portrait composition, waist-up, plants in foreground, generous outdoor light
Lighting/mood: mild morning daylight, quietly absorbed activity
Color palette: muted terracotta, herb green, warm neutral fabric, pale city gray
Materials/textures: real leaf texture, soil, ceramic pots, worn balcony rail
Constraints: no text, no logos, no watermark, no visible brand, fictional person only
Avoid: overly manicured garden, fashion pose, bright saturated color, stock-photo polish
```

## Retained supplied logo

`apps/web/public/brand/rir-logo-large.svg` was supplied by the product owner and retains its adjacent source record. It appears only on the RUST gateway, not as a splash screen.
