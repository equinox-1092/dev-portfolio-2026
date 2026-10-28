# Matías Díaz · Software Engineer Portfolio

Personal portfolio built with Astro, Tailwind CSS and TypeScript.

![Portfolio screenshot](https://imgur.com/IpzwaKg.png)

Live site: [Website](https://dev-portfolio-2026-six.vercel.app/)

## Features

- **Scroll-driven intro:** the title is cut out of a solid layer with the hero footage showing through the letters. Scrolling flies the camera into one letter until the hero is revealed. Drawn on a 2D canvas.
- **Scroll-scrubbed hero:** the hero is pinned while scrolling, and the scroll position picks the frame drawn on the canvas (WebP frames in `public/hero`).
- **Scroll-linked content:** sections settle in as they scroll into view and recede as they leave, using CSS scroll-driven animations (`animation-timeline: view()`). Browsers without support fall back to a one-time reveal.
- **Stack list hover:** the hovered line moves forward and the rest dim.
- **Certificate wheel:** cards sit on the rim of a wheel that turns with buttons, arrow keys or drag (with momentum).
- **Prerequisite map:** picking a course highlights its full chain of prerequisites.
- **English and Spanish:** separate routes (`/` and `/es`) using Astro i18n.
- **Contact form:** sends through Web3Forms, no server needed, with success and error states.
- **Accessible motion:** every animation has a `prefers-reduced-motion` alternative, and hover effects only apply on devices with a real pointer.

## Tech stack

| Technology | Purpose |
|---|---|
| [Astro](https://astro.build) | Static site generation and i18n routing |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling through `@tailwindcss/vite` |
| [TypeScript](https://www.typescriptlang.org) | Client scripts in `src/scripts` |
| [Google Fonts](https://fonts.google.com) | Chivo |

## Getting started

Requirements: **Node.js** 22.12.0 or newer, and **pnpm** (npm also works).

```bash
git clone https://github.com/equinox-1092/dev-portfolio-2026.git
cd dev-portfolio-2026
pnpm install
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321).

Production build:

```bash
pnpm build
pnpm preview
```

## Project structure

```
├── public/
│   ├── hero/            # Hero footage frames (WebP)
│   ├── certificate/     # Certificate images (WebP)
│   └── cv/              # Downloadable CV (PDF)
├── src/
│   ├── components/      # Sections: Hero, About, Stack, Projects, Certificates, Contact, Footer
│   ├── data/            # Site info, projects and certificates
│   ├── i18n/            # English and Spanish copy
│   ├── layouts/         # Base HTML layout
│   ├── pages/           # Routes: / and /es
│   ├── scripts/         # Client scripts: intro, hero, header, reveal, certificates, curriculum, contact
│   └── styles/          # Global CSS and design tokens
├── astro.config.mjs
└── package.json
```

## Contact

- **GitHub:** [equinox-1092](https://github.com/equinox-1092)
- **LinkedIn:** [Matías Díaz](https://linkedin.com/in/matias-diaz-7aa06831b)

## License

[MIT](LICENSE.md)
