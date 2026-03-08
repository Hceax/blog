# blog

Source for [Bob Hceax's Blog](https://hceax.github.io/blog/), built with [VitePress](https://vitepress.dev).

## Project Structure

```
├── .github/workflows/pages.yml        # CI: build & deploy to GitHub Pages
├── .vitepress/
│   ├── config.mts                     # site config (nav, base, transforms)
│   ├── plugins/
│   │   └── encrypt.ts                 # Vite plugin: AES-encrypt private posts at build
│   ├── shared/
│   │   └── blogMeta.ts                # shared constants (CATEGORY_MAP, H1_RE)
│   └── theme/
│       ├── index.ts                   # register global Vue components
│       ├── Layout.vue                 # inject post metadata via #doc-before slot
│       ├── custom.css                 # global layout & typography overrides
│       ├── components/
│       │   ├── BlogHome.vue           # Vivia-style homepage (cards + sidebar widgets)
│       │   ├── ArchivePage.vue        # archive page grouped by year
│       │   ├── CategoryPage.vue       # category page grouped by category
│       │   ├── PostMeta.vue           # date / category / lock badge on posts
│       │   └── EncryptedContent.vue   # password form + AES decrypt + outline sync
│       └── utils/
│           ├── date.ts                # date formatting helpers
│           ├── encryptSession.ts      # localStorage session for decrypt state
│           └── outline.ts             # trigger VitePress outline refresh
├── posts/                             # submodule → Hceax/blog-private
├── public/images/avatar.jpg           # profile avatar used by BlogHome
├── posts.data.mts                     # data loader: scan posts, extract metadata
├── index.md                           # home page
├── archives.md                        # archive page
├── categories.md                      # category page
├── about.md                           # about page
└── package.json
```

## How It Works

### Zero-Frontmatter Content Model

- Post titles are extracted from the first `# heading`.
- Publish and update dates are derived from `git log` history.
- Categories are determined by directory structure under `posts/` and mapped via `CATEGORY_MAP` in `.vitepress/shared/blogMeta.ts`.

### Build-Time Encryption

- Any `.md` file under a `private/` directory is AES-encrypted at build time by `.vitepress/plugins/encrypt.ts`.
- The plugin uses VitePress's native `createMarkdownRenderer` to render markdown to HTML, then encrypts the result with the password from `posts/_config.json`.
- Client-side decryption uses `crypto-js` with a 2-hour session stored in `localStorage`.
- Decrypting one post unlocks all private posts until the session expires or the user clicks "re-encrypt".
- After decryption, heading IDs are dynamically generated and VitePress's outline is refreshed so the right-side TOC works correctly.

### Homepage Design

The homepage (`BlogHome.vue`) uses a two-column layout inspired by [Vivia](https://github.com/saicaca/vivia):

- **Main column**: banner + post cards with excerpts
- **Sidebar**: animated profile card, category/archive/recent-posts widgets

Layout tokens are shared between homepage and article pages via CSS custom properties in `custom.css`.

## Development

```bash
git submodule update --init posts
npm install
npm run dev        # http://localhost:5173/blog/
```

## Deployment

GitHub Actions (`.github/workflows/pages.yml`) builds and deploys on:

- Push to `main`
- `repository_dispatch` from the private content repo

The private submodule is cloned via SSH deploy key (`PRIVATE_DEPLOY_KEY` secret).

## Adding a Category

1. Create the directory under `posts/` (in the private repo).
2. Add the slug → display-name mapping to `CATEGORY_MAP` in `.vitepress/shared/blogMeta.ts`.
