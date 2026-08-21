# CLI tests

These tests drive the built CLI against throwaway projects. Each test makes a temporary
directory, writes the few files that `init` and `add` read, then runs the commands in it. No
network and no package manager are involved, because every run passes `--no-install` and a local
registry path.

## Run them

```
npm run build -w @sley-ui/registry
npm run build -w sley-ui
npm run test -w sley-ui
```

The first two commands are required. The suite asserts that `dist/index.js` and the registry output
both exist, and it stops with the command to run if either is absent.

## What the projects are

A Vite project is a `package.json` that lists react and vite, a `tsconfig.app.json` that holds
comments and a trailing comma, a `vite.config.ts`, and a stylesheet that imports Tailwind. A Next
project is a `package.json` that lists next and react, a `tsconfig.json` that already declares the
alias, and `app/globals.css`. A Vue project lists vue and vite and keeps its stylesheet at
`src/style.css`.

Every fixture names its UI framework, because that is what decides which tree of the registry the
commands read, and a project with neither is refused.

The fixtures carry comments and a trailing comma on purpose. A fresh Vite template holds both, and
`JSON.parse` refuses them.

## What they cover

The alias goes into the tsconfig and into the Vite config. The token block lands in its own file and
the entry imports it one time. The framework decides the `rsc` field. A dependency is written before
the item that imports it. A Next project gets the client directive, and only on the files that need
one. Another alias prefix moves every import. The lockfile hashes the file on disk, and it pins a
versioned registry url that still resolves. An edited file survives until `--overwrite`. `add`
refuses to run before `init`.

A Vue project reads the vue tree, so it gets `.vue` files, no `.tsx`, `tsx: false` in the config, and
a lock that names the library and a versioned url under `/vue/`. Each tree installs its own Ark
package. A project holding both react and vue is refused until `--framework` names one.
