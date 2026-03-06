'use strict';

// Inject a small bootstrap script in <head>:
// 1) Reuse decrypt session across encrypted posts.
// 2) Expire stored decrypt session after TTL.
hexo.extend.filter.register('after_render:html', function (html) {
  if (typeof html !== 'string' || !html.includes('</head>')) return html;
  if (html.includes('id="hbe-session-ttl"')) return html;

  const ttlHours = Number(hexo.config.encrypt_session_ttl_hours || 2);
  const ttlMs = Math.max(1, ttlHours) * 60 * 60 * 1000;

  const script = `<script id="hbe-session-ttl">(function () {
  try {
    var PREFIX = 'hexo-blog-encrypt:#';
    var TS_PREFIX = 'hexo-blog-encrypt:ts:';
    var GLOBAL_KEY = 'hexo-blog-encrypt:global';
    var GLOBAL_TS_KEY = 'hexo-blog-encrypt:global:ts';
    var TTL_MS = ${ttlMs};
    var now = Date.now();
    var ls = window.localStorage;
    var currentStorageName = PREFIX + window.location.pathname;

    function removePageSession(storageName) {
      try { ls.removeItem(storageName); } catch (_) {}
      try { ls.removeItem(TS_PREFIX + storageName); } catch (_) {}
    }

    // Expire per-page cache.
    var toRemove = [];
    for (var i = 0; i < ls.length; i++) {
      var k = ls.key(i);
      if (!k || k.indexOf(PREFIX) !== 0) continue;
      var ts = Number(ls.getItem(TS_PREFIX + k) || 0);
      if (!ts || now - ts > TTL_MS) toRemove.push(k);
    }
    for (var j = 0; j < toRemove.length; j++) removePageSession(toRemove[j]);

    // Expire global cache.
    var gts = Number(ls.getItem(GLOBAL_TS_KEY) || 0);
    if (!gts || now - gts > TTL_MS) {
      try { ls.removeItem(GLOBAL_KEY); } catch (_) {}
      try { ls.removeItem(GLOBAL_TS_KEY); } catch (_) {}
    }

    // Bootstrap current page from global cache (single login for all encrypted posts).
    var current = ls.getItem(currentStorageName);
    var globalData = ls.getItem(GLOBAL_KEY);
    var validGlobalTs = Number(ls.getItem(GLOBAL_TS_KEY) || 0);
    if (!current && globalData && validGlobalTs && now - validGlobalTs <= TTL_MS) {
      ls.setItem(currentStorageName, globalData);
      ls.setItem(TS_PREFIX + currentStorageName, String(validGlobalTs));
    }

    // Refresh current page timestamp if session exists but ts missing.
    current = ls.getItem(currentStorageName);
    if (current && !ls.getItem(TS_PREFIX + currentStorageName)) {
      ls.setItem(TS_PREFIX + currentStorageName, String(now));
    }

    function syncGlobalFromCurrent(payload) {
      if (!payload) return;
      var tsNow = String(Date.now());
      ls.setItem(TS_PREFIX + currentStorageName, tsNow);
      ls.setItem(GLOBAL_KEY, payload);
      ls.setItem(GLOBAL_TS_KEY, tsNow);
    }

    // Hook localStorage.setItem once: capture exactly when plugin writes
    // current page decrypt payload, instead of polling by timer.
    var storageProto = Object.getPrototypeOf(ls);
    var rawSetItem = storageProto && storageProto.setItem;
    var shouldCaptureDecryptWrite = false;
    if (rawSetItem && !storageProto.__hbeSetItemHooked) {
      storageProto.setItem = function (key, value) {
        var ret = rawSetItem.apply(this, arguments);
        try {
          if (
            shouldCaptureDecryptWrite &&
            this === ls &&
            key === currentStorageName &&
            value
          ) {
            shouldCaptureDecryptWrite = false;
            syncGlobalFromCurrent(String(value));
          }
        } catch (_) {}
        return ret;
      };
      try {
        Object.defineProperty(storageProto, '__hbeSetItemHooked', {
          value: true, configurable: false, enumerable: false, writable: false
        });
      } catch (_) {}
    }

    // hexo-blog-encrypt dispatches this event before writing localStorage.
    // Enable capture and let the setItem hook do precise synchronization.
    window.addEventListener('hexo-blog-decrypt', function () {
      try {
        shouldCaptureDecryptWrite = true;
      } catch (_) {}
    });

    // Reveal real excerpts on index page when a valid session exists.
    function revealExcerpts() {
      var g = ls.getItem(GLOBAL_KEY);
      var gt = Number(ls.getItem(GLOBAL_TS_KEY) || 0);
      if (!g || !gt || now - gt > TTL_MS) return;
      var ph = document.getElementsByClassName('hbe-placeholder');
      var ex = document.getElementsByClassName('hbe-excerpt');
      for (var i = 0; i < ph.length; i++) ph[i].style.display = 'none';
      for (var i = 0; i < ex.length; i++) ex[i].style.display = '';
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', revealExcerpts);
    } else {
      revealExcerpts();
    }
  } catch (_) {}
})();</script>`;

  return html.replace('</head>', `${script}\n</head>`);
});

