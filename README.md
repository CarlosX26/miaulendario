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

There are no runtime dependencies, frameworks, or bundlers. A small Node.js script generates both localized HTML pages from one template.

## Running locally

Clone the repository:

```bash
git clone git@github.com:CarlosX26/miaulendario.git
cd miaulendario
```

Generate the localized pages:

```bash
node scripts/build.mjs
```

Then start any static HTTP server. With Python:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Testing

Run the calendar unit tests with Node.js:

```bash
node --test tests/calendar.test.js
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
├── calendar.js       # Pure calendar and ISO week calculations
├── locales/          # Portuguese and English page content
├── templates/        # Shared localized HTML template
├── scripts/build.mjs # Static localization generator
├── tests/            # Year-boundary, leap-year, plural, and time-zone tests
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
