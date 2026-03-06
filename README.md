# Bob Hceax's Blog

Personal tech blog built with [Hexo 8](https://hexo.io/) + [NexT](https://theme-next.js.org/) (Gemini scheme), auto-deployed to GitHub Pages via GitHub Actions.

**Live**: <https://hceax.github.io/blog/>

## Architecture

Content and framework are fully decoupled through two Git submodules:

| Submodule | Path | Source | Purpose |
|-----------|------|--------|---------|
| `hexo-site` | `hexo-site/` | [hexojs/hexo-starter](https://github.com/hexojs/hexo-starter) | Hexo scaffold — provides `package.json` and boilerplate |
| `source/_posts` | `source/_posts/` | [Hceax/blog-private](https://github.com/Hceax/blog-private) (private) | All posts (public + encrypted) |

This repo only stores **site config, theme config, custom scripts, and CI workflows** — no article content or `node_modules`.

```
├── .github/
│   ├── workflows/pages.yml     # GitHub Actions: build + deploy
│   └── dependabot.yml          # automated npm dependency updates
├── scripts/
│   ├── auto-title.js           # auto-extract title / date / category / encryption
│   └── encrypt-session-ttl.js  # cross-post decrypt session sharing with TTL
├── source/
│   ├── _posts/                 # ← submodule → blog-private
│   ├── about/                  # about page
│   ├── categories/             # categories page
│   └── images/                 # static assets (avatar, etc.)
├── hexo-site/                  # ← submodule → hexo-starter
├── _config.yml                 # Hexo site config
├── _config.next.yml            # NexT theme config (Gemini)
├── setup.ps1                   # one-click local dev setup (PowerShell)
├── .gitmodules
└── .gitignore
```

## Zero Front-matter Authoring

Posts are **plain Markdown** with no YAML front-matter required. `scripts/auto-title.js` auto-extracts everything at render time:

| Field | Source |
|-------|--------|
| **Title** | First `# heading` in the file (removed from body to avoid duplication) |
| **Date** | `git log --diff-filter=A` — first commit timestamp |
| **Updated** | `git log -1` — latest commit timestamp |
| **Category** | Top-level directory name under `_posts/`, reverse-mapped through `category_map` in `_config.yml` |
| **Encryption** | Path contains `/private/` → password auto-applied from `_posts/_config.json` |

## Encrypted Post Session

`scripts/encrypt-session-ttl.js` injects a client-side script that:

- **Single unlock, site-wide access** — decrypting any encrypted post unlocks all others via shared `localStorage`
- **TTL auto-expiry** — decrypt sessions expire after 2 hours by default (configurable via `encrypt_session_ttl_hours` in `_config.yml`)
- **Precise capture** — hooks `localStorage.setItem` to sync the decryption payload to a global cache the instant `hexo-blog-encrypt` writes it

## Category System

Categories are defined by top-level directory names under `source/_posts/`. The mapping from directory slug to display name is configured in `category_map` in `_config.yml`.

Within each category directory:
- `*.md` directly under the category → **public** post
- `private/*.md` → **encrypted** post

Adding a new category: create the directory in `source/_posts/` + add a slug→name mapping in `category_map`.

## CI/CD

Triggered on push to `main` or `repository_dispatch` (`private-update`):

1. Checkout `hexo-site` submodule (public, HTTPS)
2. Checkout `source/_posts` submodule via SSH deploy key
   - If `PRIVATE_DEPLOY_KEY` is not configured, a placeholder post is generated so the site still builds
3. `npm install` → `hexo generate` → deploy to GitHub Pages

### Required Secrets

| Secret | Purpose |
|--------|---------|
| `PRIVATE_DEPLOY_KEY` | SSH private key for cloning `blog-private`. The corresponding public key must be added as a read-only Deploy Key on the `blog-private` repo. |

## Local Development

```powershell
git clone --recurse-submodules git@github.com:Hceax/blog.git
cd blog
.\setup.ps1        # install dependencies
npx hexo s         # http://localhost:4000/blog/
```

Without access to `blog-private`, `setup.ps1` skips the posts submodule with a warning — the site still starts with no posts.

## Tech Stack

| Component | Version |
|-----------|---------|
| Hexo | 8.x |
| NexT theme | 8.x (Gemini) |
| hexo-blog-encrypt | 3.x |
| Node.js (CI) | 20 |
| Deployment | GitHub Pages via `actions/deploy-pages@v4` |
