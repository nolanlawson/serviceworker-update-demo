serviceworker-update-demo
====

Effort to write a ServiceWorker demo app that properly manages updates, defined by a version in `package.json`.

Usage
---

Check out the code, `npm install`, then run

    npm run dev

Navigate to [http://localhost:9000](http://localhost:9000). You can update the ServiceWorker version by merely changing the version number in `package.json`; the server will automatically update.

Note that the page prints the version it thinks it's on, and the ServiceWorker `console.log()`s the version it's on as well. You can also see the version in the "Cache Storage" section in the Resources tab.