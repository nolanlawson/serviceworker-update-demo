document.getElementById('display').innerHTML =
  'Hello, my version is: ' + require('../package.json').version;

var localForage = require('localforage');
var semver = require('semver');

function onFirstLoad() {
  console.log('sw activated (first load)');
}

function onClaimed() {
  console.log('sw claimed');
}

function onInstalled() {
  console.log('sw installed');

  localForage.getItem('active-version').then(activeVersion => {
    console.log('active-version', activeVersion);
    // activeVersion is undefined for sw-null
    // if the main version has changed, bail
    if (activeVersion &&
      semver.parse(activeVersion).major !== semver.parse(self.version).major) {
      return;
    }
    console.log('activeVersion', activeVersion);
  }).catch(console.log.bind(console));
}

function onStateChange(newWorker) {
  if (newWorker.state == 'activated') {
    onFirstLoad();
    if (navigator.serviceWorker.controller) {
      onClaimed();
    }
  } else if (newWorker.state == 'installed' && navigator.serviceWorker.controller) {
    onInstalled();
  }
}

function onUpdateFound(registration) {
  console.log('onUpdateFound');
  var newWorker = registration.installing;

  registration.installing.addEventListener('statechange',
    () => onStateChange(newWorker));
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', {
    scope: './'
  }).then(registration => {
    registration.addEventListener('updatefound', () => onUpdateFound(registration));
  });
}