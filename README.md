<p align="center">
  <img src="./favicon.svg" width="88" height="88" alt="Miaulendário icon" />
</p>

<h1 align="center">Miaulendário</h1>

<p align="center">
  A playful visual calendar for checking the current week, tracking yearly progress, and seeing how much time is left in the year.
</p>

<p align="center">
  <a href="https://miaulendario.vercel.app/">Live demo</a>
  ·
  <a href="https://www.buymeacoffee.com/sr.cj">Buy me a coffee</a>
</p>

![Miaulendário preview](./og-image.png)

## About

Miaulendário displays the current ISO week in a yearly calendar inspired by graph paper, handwritten notes, and ink stamps. Everything runs directly in the browser, with no accounts, cookies, tracking, or API requests.

## Features

- Current ISO week and ISO week-numbering year.
- Yearly progress percentage.
- Current day of the year.
- Remaining days and weeks.
- Visual grid for past, current, and upcoming weeks.
- Responsive layout with reduced-motion support.
- Interactive floating cat with browser-generated audio.
- SEO, Open Graph, and Twitter Card metadata.
- Content Security Policy and security headers for Vercel.

## Technologies

- HTML5
- CSS3
- JavaScript vanilla
- Web Audio API
- Vercel

There are no dependencies, frameworks, bundlers, or build steps.

## Running locally

Clone the repository:

```bash
git clone git@github.com:CarlosX26/miaulendario.git
cd miaulendario
```

Start any static HTTP server. With Python:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Deploying to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCarlosX26%2Fmiaulendario)

When importing the repository into Vercel, use:

- **Framework Preset:** Other
- **Build Command:** leave empty
- **Output Directory:** `.`

The [`vercel.json`](./vercel.json) file configures clean URLs and security headers.

## Project structure

```text
.
├── index.html        # Page structure and metadata
├── index.css         # Visual design and responsive layout
├── index.js          # Calendar calculations and interactions
├── cat.gif           # Floating cat animation
├── favicon.svg       # Browser and search favicon
├── og-image.png      # Social sharing preview
├── robots.txt        # Crawler rules
├── sitemap.xml       # Search engine sitemap
└── vercel.json       # Vercel deployment configuration
```

## Privacy and security

All calculations run locally in the browser. The website does not collect or transmit personal data.

The versioned `.env` file does not contain credentials or sensitive configuration — it is only a cooking-themed easter egg. Never place real secrets in public client-side JavaScript.

## Author

Created by [CarlosX26](https://github.com/CarlosX26).

If Miaulendário made your week a little more fun, you can [buy me a coffee](https://www.buymeacoffee.com/sr.cj).
