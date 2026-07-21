# Calm in the Rush

A nonprofit, open-source moment of calm. It opens on one full-screen, slow nature
scene with the sound recorded alongside that footage, and otherwise gets out of the
way. No accounts, questionnaires, streaks, notifications, or tracking.

The whole app is a single static `index.html` with inline CSS and JavaScript, plus
local media in `assets/`. There is no build step and no runtime dependency.

## Run locally

Because browsers treat a `file://` page more strictly (autoplay and clipboard),
serve the folder over http. Any static server works; a few options:

```bash
# Node (npx, no install)
npx serve .

# Python
python -m http.server 8123

# VS Code: the "Live Server" extension, "Open with Live Server"
```

Then open the printed URL (for example http://localhost:8123). Sound starts on your
first tap or click, since browsers mute autoplay until then.

## Deploy

The site is fully static, so deployment needs no build command and no output
directory.

### Vercel

1. Import the repository at https://vercel.com/new.
2. Framework preset: **Other**. Leave build command and output directory empty.
3. Deploy.

`vercel.json` sets long-lived caching for `assets/` and no-cache for `index.html`,
so media is cached hard while updates to the page go live immediately.

## Media and credits

All footage is real, keeps its originally captured sound, and is cleared for
redistribution. See the source list in `index.html` and the scene table in
`APP_REQUIREMENTS.md`.

- Misty mountain lake - "Misty Morning at Lake McDonald" by GlacierNPS, Public Domain
- Sunlit forest - "Valla forest Nature reserve - A quiet place" by Fredrik Johansson, CC BY 3.0
- Wheat field - "ASMR field of wheat - nature" by Coup 53, CC BY 3.0
- Mountain brook - "Mountain brook in Himalayas" by Poojilsharma07, CC BY-SA 4.0
