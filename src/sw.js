require('regenerator/runtime');
require('serviceworker-cache-polyfill');

var semver = require('semver');
var localForage = require('localforage');

// 'package-json-versionify' strips out most of package.json
var pkg = require('../package.json');

// Using Jake Archibald's service worker "semver" style here
// Pattern here is "a.b.c"
// a: version-isolated change, don't let both versions run together
// b: new feature
// c: bug fix
var version = pkg.version;

var staticContent = [
  '/',
  '/index.js'
];

self.addEventListener('install', function install(event) {
  console.log('install v' + version);
  event.waitUntil((async () => {
    var activeVersionPromise = localForage.getItem('active-version');
    var cache = await caches.open('cache-' + version);

    await cache.addAll(staticContent);

    var activeVersion = await activeVersionPromise;

    console.log('activeVersion:', activeVersion, 'current version:', version);
    if (!activeVersion ||
      semver.parse(activeVersion).major === semver.parse(version).major) {
      // wrapping in an if while Chrome 40 is still around
      if (self.skipWaiting) {
        console.log('skipWaiting()');
        self.skipWaiting();
      }
    }
  })());
});

var expectedCaches = [
  'cache-' + version
];

self.addEventListener('activate', function (event) {
  console.log('activate v' + version);
  event.waitUntil((async () => {
    // activate right now
    await self.clients.claim();
    // remove caches beginning "svgomg-" that aren't in
    // expectedCaches
    var cacheNames = await caches.keys();
    console.log('cacheNames', cacheNames);
    for (var cacheName of cacheNames) {
      if (!/^cache-/.test(cacheName)) {
        continue;
      }
      if (expectedCaches.indexOf(cacheName) == -1) {
        console.log('deleting', cacheName);
        await caches.delete(cacheName);
      }
    }

    await localForage.setItem('active-version', version);
  })());
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(r => r || fetch(event.request))
  );
});
