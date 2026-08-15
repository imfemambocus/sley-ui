# Docs site

The site is the product. It carries a full demo application, because density only shows when many
components sit together, and it publishes the measurements beside the components they belong to.

## Run it

```
npm run dev -w docs
```

To drive it from a browser in a session, pin the port so the two cannot come apart:

```
npx vite --port 5200 --strictPort
```

## What is where

`src/site` holds the shell: the header, the sidebar, the router and the small pieces the pages are
written out of (`Prose`, `Demo`, `Api`, `Measured`, `CodeBlock`). `src/pages` holds one file per
page. `src/content/components` holds one file per component, each exporting a `ComponentDoc` with
its demo, its props and its measurements. `src/console` holds the demo application on the overview.

The run data and the views built on it come from `@sley-ui/demo`, which the lab imports too, so the
two demonstrations cannot drift apart.

## The router

There is no routing library. The site has 23 static paths and one fallback, so a `pushState` and a
`popstate` listener cover it. A plain left click with no modifier is intercepted; a middle click, a
command click and an external href are left to the browser.

Any host serving this needs every path rewritten to `index.html`, except `/r/`, which is the
registry. `vercel.json` at the repo root does that.

## The registry ships with the site

`bundle-registry.mjs` runs after the Vite build and copies `packages/registry/dist/r` into
`dist/r`. The site and the registry are one deployment, and `/r/` is the path that `BASE` in the
registry build script already names. Build the registry first, or the script stops and says so.

## Measurements

Every number on a Measured block came out of a browser. Do not add one you have not read off a
screen, and re-measure rather than copying a number across from somewhere else: the frame a
component sits in changes it.
