# blog

Source for [Bob Hceax's Blog](https://hceax.github.io/blog/), built with [VitePress](https://vitepress.dev).

## Project Structure

```
├── .vitepress/
│   ├── config.mts                  # site config (nav, base, transforms)
│   ├── plugins/encrypt.ts          # Vite plugin: AES-encrypt private posts at build time
│   └── theme/
│       ├── index.ts                # register global Vue components
│       ├── Layout.vue              # inject post metadata via doc-before slot
│       └── components/
│           ├── BlogHome.vue        # home page post listing
│           ├── ArchivePage.vue     # archive page (grouped by year)
│           ├── CategoryPage.vue    # category page (grouped by category)
│           ├── PostMeta.vue        # date & category tag on post pages
│           └── EncryptedContent.vue # password form + AES decrypt + session
├── posts/                          # submodule → Hceax/blog-private
├── posts.data.mts                  # data loader: scan posts, extract metadata
├── index.md                        # home page
├── archives.md                     # archive page
├── categories.md                   # category page
├── about.md                        # about page
├── package.json
└── .github/workflows/pages.yml     # CI: build & deploy to GitHub Pages
```

## How It Works

- **Zero front-matter** — post titles are extracted from the first `# heading`; dates come from Git history.
- **Directory-based categories** — top-level directories under `posts/` map to category names via `CATEGORY_MAP` in `config.mts`.
- **Encryption** — any `.md` under a `private/` directory is AES-encrypted at build time by the Vite plugin. The password is read from `posts/_config.json`. Client-side decryption uses CryptoJS with a 2-hour session stored in localStorage.
- **Session sharing** — decrypting one private post unlocks all others until the session expires or the user clicks "re-encrypt".

## Local Development

```bash
npm install
npm run dev        # http://localhost:5173/blog/
```

The `posts/` submodule must be initialized:

```bash
git submodule update --init posts
```

## Deployment

Handled by GitHub Actions (`.github/workflows/pages.yml`). Triggers on push to `main` or `repository_dispatch` from the private repo. The private submodule is cloned via SSH deploy key (`PRIVATE_DEPLOY_KEY` secret).

## Adding a Category

1. Create the directory under `posts/` (in the private repo).
2. Add the slug → display-name mapping to `CATEGORY_MAP` in `.vitepress/config.mts`.
