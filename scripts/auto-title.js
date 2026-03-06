'use strict';

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const moment = require('moment');

const FIRST_H1 = /^#\s+(.+)$/m;

// Insert <!-- more --> after the first paragraph of body text for index excerpts.
// Skips leading headings so the excerpt contains actual prose, not just a section title.
function insertExcerptBreak(text) {
  if (text.includes('<!-- more -->')) return text;
  const lines = text.split('\n');
  let inParagraph = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#') || line === '') {
      if (inParagraph) {
        lines.splice(i, 0, '<!-- more -->');
        return lines.join('\n');
      }
      continue;
    }
    if (line.startsWith('```') || line.startsWith('|')) continue;
    inParagraph = true;
  }
  return text;
}

let _privateConfig = null;
function getPrivateConfig() {
  if (_privateConfig) return _privateConfig;
  const configPath = path.join(hexo.source_dir, '_posts', '_config.json');
  try {
    _privateConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (_) {
    _privateConfig = {};
  }
  return _privateConfig;
}

// 从 _config.yml 的 category_map（中文→英文slug）反转得到 英文目录名→中文显示名
function buildCategoryMap() {
  const map = hexo.config.category_map || {};
  const reversed = {};
  for (const [displayName, slug] of Object.entries(map)) {
    reversed[slug] = displayName;
  }
  return reversed;
}

// 从 git 历史获取文件级别的日期
// flag='first': 首次提交日期(发布时间)  flag='last': 最后提交日期(编辑时间)
function gitDate(fullPath, flag) {
  try {
    const cmd = flag === 'first'
      ? `git log --diff-filter=A --follow --format=%aI -- "${fullPath}"`
      : `git log -1 --format=%aI -- "${fullPath}"`;
    const out = execSync(cmd, {
      encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
    // --diff-filter=A 可能返回多行(rename history)，取最后一行即最早记录
    const line = flag === 'first' ? out.split('\n').pop() : out;
    if (line) return moment(line);
  } catch (_) {}
  return null;
}

// 未入 git 的新文件回退到文件 mtime，保证本地预览也有日期
function getPostDates(fullPath) {
  let created = gitDate(fullPath, 'first');
  const updated = gitDate(fullPath, 'last');

  if (!created) {
    try { created = moment(fs.statSync(fullPath).mtime); } catch (_) {}
  }

  return { created: created || moment(), updated: updated || created || moment() };
}

// 必须 async：setCategories 返回 Promise，不 await 会导致分类页漏文章
hexo.extend.filter.register('before_post_render', async function (data) {
  // Skip README files — they are repo documentation, not blog posts.
  const basename = path.basename(data.source).toLowerCase();
  if (basename === 'readme.md') {
    data.published = false;
    return data;
  }

  const fullPath = data.full_source || path.join(hexo.source_dir, data.source);

  // --- 日期：从 git 提交记录读取，不依赖 front-matter ---
  const dates = getPostDates(fullPath);
  data.date = dates.created;
  data.updated = dates.updated;

  // --- 标题：从正文第一个 # heading 提取，并从正文中删除避免重复显示 ---
  const raw = data.raw || '';
  const titleMatch = raw.match(FIRST_H1);
  if (titleMatch) {
    data.title = titleMatch[1].trim();
    // content 和 _content 都要删，确保 markdown 渲染前 H1 已移除
    data.content = (data.content || '').replace(FIRST_H1, '').trimStart();
    data._content = (data._content || '').replace(FIRST_H1, '').trimStart();
  } else if (!data.title || data.title === 'untitled') {
    const filename = path.basename(data.source, path.extname(data.source));
    data.title = filename.replace(/[-_]+/g, ' ').trim();
  }

  // --- 加密：路径含 /private/ 的文章自动设置密码 ---
  const rel = data.source.replace(/\\/g, '/');
  const parts = rel.split('/');
  if (parts.includes('private')) {
    const cfg = getPrivateConfig();
    if (cfg.password) {
      data.password = cfg.password;
      data.message = cfg.message || '';
    }
  }

  // --- 摘要：自动截断，首页只显示第一段 ---
  data.content = insertExcerptBreak(data.content || '');
  data._content = insertExcerptBreak(data._content || '');

  // --- 分类：取 _posts/ 下的顶层目录名，通过 category_map 反查中文显示名 ---
  // _posts/engineering/private/foo.md → parts[1] = 'engineering'
  if (parts.length >= 3 && typeof data.setCategories === 'function') {
    const categoryDir = parts[1];
    if (categoryDir !== '_posts') {
      const categoryMap = buildCategoryMap();
      const displayName = categoryMap[categoryDir] || categoryDir;
      await data.setCategories([displayName]);
    }
  }

  return data;
});

// Priority 1: runs before hexo-blog-encrypt.
// 1) Remove leftover <h1> from rendered HTML.
// 2) For encrypted posts, copy the real excerpt into `abstract` so the
//    index page shows actual content instead of a generic placeholder.
hexo.extend.filter.register('after_post_render', function (data) {
  if (data.content) {
    data.content = data.content.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/, '');
  }
  if (data.password && data.content) {
    const cfg = getPrivateConfig();
    const placeholder = cfg.abstract || '此文章已加密，请输入密码查看。';
    const moreIdx = data.content.indexOf('<!-- more -->');
    const realExcerpt = moreIdx > 0 ? data.content.substring(0, moreIdx).trim() : '';
    data.abstract = `<span class="hbe-placeholder">${placeholder}</span>`
      + (realExcerpt ? `<span class="hbe-excerpt" style="display:none">${realExcerpt}</span>` : '');
  }
  return data;
}, 1);
