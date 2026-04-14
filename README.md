# 🍃 Teahouse miska s listim

A multi-page static website for a teahouse, built with **Astro**. Features a warm, elegant design with rich earthy tones.

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with hero, features, story teaser, menu highlights & news |
| About | `/about/` | Founder story, team profiles, values, and visit info |
| Menu | `/menu/` | Full menu: loose-leaf teas, specialty drinks, pastries & ceremonies |
| News | `/news/` | Stories, events, workshops and teahouse updates |

## Tech Stack

- **Framework**: [Astro](https://astro.build) (static output)
- **Styling**: Plain CSS with custom properties (no framework dependency)
- **Fonts**: Cormorant Garamond + Lato (via Google Fonts)

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server at http://localhost:4321
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

---

## Deploying to GitHub Pages

### Automatic deployment via GitHub Actions (recommended)

The repository includes a workflow at `.github/workflows/deploy.yml` that automatically builds and deploys the site to GitHub Pages whenever you push to `main`.

**One-time setup:**

1. Open your repository on GitHub and go to **Settings → Pages**.
2. Under **Source**, select **GitHub Actions**.
3. Push a commit to `main` — the workflow will build and deploy automatically.
4. Your site will be live at `https://<your-username>.github.io/<repository-name>/`.

> **Note**: The `astro.config.mjs` file contains `site` and `base` settings. Make sure they match your GitHub username and repository name:
>
> ```js
> // astro.config.mjs
> export default defineConfig({
>   site: 'https://<your-username>.github.io',
>   base: '/<repository-name>',
> });
> ```

### Manual deployment

If you prefer to deploy manually without CI/CD:

```bash
# Build the site
npm run build

# The output is in the `dist/` folder.
# Push the contents of `dist/` to the `gh-pages` branch, or use a tool like `gh-pages`:
npx gh-pages -d dist
```

Then enable GitHub Pages in **Settings → Pages** and set the source branch to `gh-pages`.

---

## Project Structure

```
miskaslistim/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro   (Home)
│   │   ├── about.astro   (About Us)
│   │   ├── menu.astro    (Menu)
│   │   └── news.astro    (News)
│   └── styles/
│       └── global.css
├── .github/
│   └── workflows/
│       └── deploy.yml
├── astro.config.mjs
└── package.json
```

## website colors
common:
background: rgb(224, 212, 189)

first room (forest simple gradient siluets):
trees gradient: rgb(165, 152, 123)

second room (rigged mountain range with setting sun)
front mountains: rgb(73, 108, 119)
mid mountains: rgb(168, 195, 194)
far mountains rgb(203, 214, 218)
sun: rgb(212, 93, 71)

third room (japanese clouds)
clouds: rgb(73, 108, 119)

font on buissness cards is "merriweather"

temporary page 
logo 
pripravujeme cajovnu 
newsleters?
