git submodule sync --recursive

# Hexo framework scaffold (required).
git submodule update --init hexo-site
if ($LASTEXITCODE -ne 0) {
  throw "Failed to init required submodule: hexo-site"
}

# Blog posts submodule (private repo — optional for external contributors).
git submodule update --init source/_posts
if ($LASTEXITCODE -ne 0) {
  Write-Host "Warning: source/_posts submodule is unavailable (no access). Blog will have no posts." -ForegroundColor Yellow
  New-Item -ItemType Directory -Force source/_posts | Out-Null
}

Copy-Item hexo-site\package.json . -Force
npm install
npm install hexo-theme-next
npm install hexo-blog-encrypt
Write-Host "Ready! Run 'npx hexo s' to start local server." -ForegroundColor Green
