# Vice City Cover Maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun · gta6-cover-art-01 rank](https://make.fun/badge/gta6-cover-art-01/Jangsurra250/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun · gta6-cover-art-01 reward](https://make.fun/badge/gta6-cover-art-01/Jangsurra250/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

A web app that turns your photo and a caption into GTA-style multi-panel cover art — a hero panel plus two smaller panels, a painted retro sun and palm silhouette, bold gradient lettering, and a Vice City sunset, neon, dusk or mono colour grade. It exports a PNG to share.

Built for the [make.fun](https://make.fun/bounty/gta6-cover-art-01) bounty **gta6-cover-art-01 — Make GTA 6 Cover Art**.

## How it works

1. **Photos** — pick a photo for each of the three panels, or tick "One photo fills every panel" and use one photo in all three with a different crop each. Two free sample photos are built in (Pier, Boulevard).
2. **Layout & grade** — Trio, Split or Hero panel layout; Sunset, Neon, Dusk or Mono grade.
3. **Crop the panel** — pick a panel, then zoom and pan it until the framing is right.
4. **Caption** — type the big title and the subtitle line (default "Vice City • Leonida").
5. **Size & export** — Square 1080 × 1080, Portrait 1080 × 1350 or Wide 1920 × 1080, then Export PNG. The preview on the right is live the whole time.

| Size | Pixels | Best for |
| --- | --- | --- |
| Square | 1080 × 1080 | Feed post |
| Portrait | 1080 × 1350 | Feed post, tall |
| Wide | 1920 × 1080 | Story banner, desktop share |

The screenshots in `screenshots/` show the wide cover first, then the editor with a photo loaded, then the portrait and square covers — the same four scenes the app renders from its own code.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

The app is plain static files under `app/` — no build step, no network request, and your photos never leave your machine. It works offline in desktop Chrome.

## The art

Everything on the poster is drawn in code (`app/src/cover.js`): the panel grid with white gutters, the striped retro sun, the palm silhouette, the grade washes and the outlined gradient title. The lettering is a system bold sans — no Rockstar Games logo, artwork, character or font is used anywhere. This is a fan-made poster maker, not affiliated with Rockstar Games.

## Files

- `app/index.html` — the editor page
- `app/style.css` — the editor chrome
- `app/src/cover.js` — the cover painter: panels, sun, palm, grades, lettering
- `app/src/main.js` — page wiring: photos, controls, export
- `app/src/shots.js` — fixed scenes for the screenshots
- `app/samples/` — two free-to-use sample photos
- `screenshots/` — the cover, the editor at work, and covers in the other sizes
- `main.ts` — hands `app/` and `screenshots/` in with a dossier (Node 22, stdlib only)

## License

MIT — see `LICENSE`.
