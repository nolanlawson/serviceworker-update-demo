document.getElementById('display').innerHTML =
  'Hello, my version is: ' + require('./package.json').version;

var localForage = require('localforage');
var semver = require('semver');
var currentVersion = require('./package.json').version;

function onFirstLoad() {
  console.log('sw activated (first load)');
}

function onClaimed() {
  console.log('sw claimed');
}

function onInstalled() {
  console.log('sw installed');

  localForage.getItem('active-version').then(activeVersion => {
    console.log('main thread: activeVersion:', activeVersion,
      'my version:', currentVersion);
    // activeVersion is undefined for sw-null
    // if the main version has changed, bail
    if (activeVersion &&
      semver.parse(activeVersion).major !== semver.parse(currentVersion).major) {
      document.getElementById('update').innerHTML =
        'You have an update available! You should reload';
    }
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
  navigator.serviceWorker.register('/sw-bundle.js', {
    scope: './'
  }).then(registration => {
    console.log('sw registration:', registration);
    registration.addEventListener('updatefound', () => onUpdateFound(registration));
  });
}