<p align="center">
  <img src="./favicon.svg" width="88" height="88" alt="Miaulendário icon" />
</p>

<h1 align="center">Miaulendário</h1>

<p align="center">
  A playful visual calendar for checking the current week, tracking yearly progress, and seeing how much time is left in the year.
</p>

<p align="center">
  <a href="https://www.miaulendario.online/">Live demo</a>
  ·
  <a href="https://www.buymeacoffee.com/sr.cj">Buy me a coffee</a>
</p>

![Miaulendário preview](./og-image.png)

## About

Miaulendário displays the current ISO week in a yearly calendar inspired by graph paper, handwritten notes, and ink stamps. The interface is available in Brazilian Portuguese and English, with no accounts or cookies.

## Features

- Current ISO week and ISO week-numbering year.
- Explicit separation between the local calendar year and ISO week-numbering year.
- Yearly progress percentage.
- Current day of the year.
- Remaining days and weeks.
- Localized singular and plural labels.
- Live countdown in minutes to the next Friday.
- Friday celebration with a weekly joke, plus native sharing or text-and-link copying in both languages.
- Snapshot sharing pages with dynamic Open Graph images that preserve the sender's time, language, and time zone.
- Visual grid for past, current, and upcoming weeks, including date ranges.
- Pre-rendered Brazilian Portuguese and English pages.
- Responsive layout with reduced-motion support.
- Interactive floating cat with browser-generated audio.
- SEO, Open Graph, and Twitter Card metadata.
- Privacy-friendly Vercel Web Analytics.
- Content Security Policy and security headers for Vercel.

## Technologies

- HTML5
- CSS3
- JavaScript vanilla
- Web Audio API
- Vercel

The browser application has no framework or runtime dependencies. A small Node.js
script generates both localized HTML pages from one template. Vercel Functions
use `@vercel/og` to render social card PNGs on the server.

## Running locally

Clone the repository:

```bash
git clone git@github.com:CarlosX26/miaulendario.git
cd miaulendario
```

With Node.js 24, install dependencies and generate the localized pages:

```bash
npm ci
npm run generate
```

Then start any static HTTP server. With Python:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

The Python server only serves static files. To also exercise `/share`, `/api/og`,
and the `.env` function locally, use `npx vercel dev` with your Vercel project.

## Adding jokes

The project's own jokes live in `data/jokes.json`. Each entry has a unique `id`
and matching `pt-BR` and `en` texts. Add entries to this array, then run:

```bash
node scripts/build.mjs
```

The build validates IDs and translations and embeds only the current language's
jokes into each generated page. No runtime fetch, external API, or database server
is needed. Interface labels remain in `locales/`.

Jokes rotate weekly in array order. Changing the order or number of entries can
change the selected joke for the current week. Commit the JSON and regenerated
HTML pages together when publishing changes. The build also saves versioned joke
collections in `data/share-catalogs.json`; keep older versions so existing shared
links continue to work. Commit this generated archive too.

## Snapshot sharing

The share button creates `/share?t=...&tz=...&lang=...&v=...`, where `t` is the
Unix timestamp in minutes, `tz` is the sender's IANA time zone, `lang` is `pt-BR`
or `en`, and `v` identifies a saved joke collection. Both the HTML and PNG are
generated from those values, never from the time a crawler visits the link.

`/share` rewrites to `/api/share`, returning HTML with Open Graph/Twitter metadata
and a link back to the live calendar. `/api/og` accepts the same parameters and
returns a 1200×630 PNG. Friday cards show a joke; other days show the minutes that
remained at sharing time. No external image or font requests are needed to render.
Snapshots are marked `noindex, follow` and are intentionally cacheable. Sharing
the bare homepage still uses its original static OG image.

## Testing

Run the calendar, browser-interaction, endpoint, and PNG-rendering tests:

```bash
node --test tests/*.test.js
```

## Deploying to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCarlosX26%2Fmiaulendario)

When importing the repository into Vercel, use:

- **Framework Preset:** Other
- **Build Command:** leave empty
- **Output Directory:** `.`

The localized HTML files are committed to the repository, so Vercel does not need a build command. The [`vercel.json`](./vercel.json) file configures clean URLs, rewrites, and security headers.

## Project structure

```text
.
├── index.html        # Page structure and metadata
├── en/index.html     # Generated English page, served at /en/
├── index.css         # Visual design and responsive layout
├── index.js          # Page rendering and interactions
├── friday.js         # Friday celebration, live countdown, and sharing
├── calendar.js       # Pure calendar and ISO week calculations
├── data/jokes.json   # Original bilingual joke collection
├── data/share-catalogs.json # Generated archive for existing share URLs
├── api/share.js      # Snapshot HTML with Open Graph metadata
├── api/og.js         # Dynamic PNG endpoint
├── lib/             # Server-side snapshot calculations and image rendering
├── locales/          # Portuguese and English page content
├── templates/        # Shared localized HTML template
├── scripts/build.mjs # Static localization generator
├── tests/            # Calendar, time-zone, Friday transition, and sharing tests
├── api/env.js        # Serves the public .env easter egg
├── .vercelignore     # Keeps source-only files out of deployments
├── cat.gif           # Floating cat animation
├── favicon.svg       # Browser and search favicon
├── og-image.png      # Social sharing preview
├── robots.txt        # Crawler rules
├── sitemap.xml       # Search engine sitemap
└── vercel.json       # Vercel deployment configuration
```

## Privacy and security

All calendar calculations run locally in the browser. Vercel Web Analytics records anonymized page-view data without cookies.

The versioned `.env` file does not contain credentials or sensitive configuration — it is only a cooking-themed easter egg, available at [miaulendario.online/.env](https://www.miaulendario.online/.env) and [miaulendario.online/env](https://www.miaulendario.online/env). Never place real secrets in this file or in public client-side JavaScript.

## Author

Created by [CarlosX26](https://github.com/CarlosX26).

If Miaulendário made your week a little more fun, you can [buy me a coffee](https://www.buymeacoffee.com/sr.cj).
