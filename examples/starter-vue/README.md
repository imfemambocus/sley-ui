# Sley UI starter, Vue

A Vite and Vue app with Sley UI already installed, so you can see the components working before you
run anything against your own project.

Open it in the browser, with nothing to install:

https://stackblitz.com/github/imfemambocus/sley-ui/tree/main/examples/starter-vue?file=src%2FApp.vue

Or locally:

```sh
npm install
npm run dev
```

## What this is

It is a real install, not a copy of the library source. `sley.lock` records the registry version and
a hash for every file, so `npx sley-ui update` inside this directory merges a newer release into it
the same way it would in your own repo.

It was produced by running the CLI against the registry:

```sh
npm create vite@latest starter-vue -- --template vue-ts
npm install tailwindcss @tailwindcss/vite
npx sley-ui init
npx sley-ui add table filter-bar button
```

`init` reads `vue` out of the dependencies and installs from the Vue tree of the registry. The Vite
template already declares the `@` alias in both `vite.config.ts` and `tsconfig.app.json`, so `init`
says so and leaves them alone.

## Worth knowing

A column is data here and nothing else. The cell markup comes from a slot named after the column
key, so `#cell-status` draws the status cell, which keeps your template where you can read it. That
is the one place the Vue API differs from the React one.

The density attribute goes on the `html` element, because the tokens are declared on `:root`.
`App.vue` writes it there in a watcher. Putting it on a wrapper element instead does nothing at all,
which is easy to miss, since every class still resolves and only the sizes stay put.

The fonts come from Google Fonts in `index.html`. Nothing breaks without them, but Archivo and
IBM Plex Mono carry half the identity, and the data face is the one doing the work.

If you would rather run the install commands yourself and watch them work, `examples/blank-vue` is
the same thing with nothing installed.

## Worth knowing about the config

`tsconfig.app.json` inlines its options rather than extending `@vue/tsconfig`, which is what a fresh
Vite template does. The preset is a package, and this directory is not installed by the repository it
sits in, so extending it made the repository's own lint fail on a clean checkout. Nothing else about
the project changes.
