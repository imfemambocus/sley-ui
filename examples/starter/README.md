# Sley UI starter

A Vite and React app with Sley UI already installed, so you can see the components working before
you run anything against your own project.

Open it in the browser, with nothing to install:

https://stackblitz.com/github/imfemambocus/sley-ui/tree/main/examples/starter

Or locally:

```sh
npm install
npm run dev
```

## What this is

It is a real install, not a copy of the library source. `sley.lock` records the registry version and
a hash for every file, so `npx sley-ui update` inside this directory merges a newer release into it
the same way it would in your own repo.

It was produced by running the published CLI against the live registry:

```sh
npm create vite@latest starter -- --template react-ts
npm install tailwindcss @tailwindcss/vite
npx sley-ui init
npx sley-ui add table filter-bar button
```

## Worth knowing

The density attribute goes on the `html` element, because the tokens are declared on `:root`. `App.tsx`
writes it there in an effect. Putting it on a wrapper element instead does nothing at all, which is
easy to miss, since every class still resolves and only the sizes stay put.

The fonts come from Google Fonts in `index.html`. Nothing breaks without them, but Archivo and
IBM Plex Mono carry half the identity, and the data face is the one doing the work.
