<img src="https://raw.githubusercontent.com/imfemambocus/sley-ui/main/.github/banner-light.png" alt="Sley UI: components for interfaces that hold a lot of data." width="100%">

## About

This is the command line tool for [Sley UI](https://sley-ui.dev), a component registry for React and Vue. It covers the interfaces that hold a lot of data: tables, filter bars, command palettes, side panels and long forms.

The components are not a dependency of your project. This tool copies the source files in, and you own them from that point.

## Use

```sh
npx sley-ui init
npx sley-ui add table
```

Install it globally and the command shortens to `sley`.

`init` reads your project. It finds the path alias and the stylesheet that pulls Tailwind in, then writes the token block as a file of its own. Vite and Next are both supported for React, and Vite and Nuxt for Vue. On Nuxt it edits no config file at all, because Nuxt declares the alias itself.

It also reads which UI framework you are on out of your dependencies, and installs from that tree of the registry. A repository holding both refuses rather than guessing, and `--framework react` or `--framework vue` settles it.

`add` writes a component and everything it imports. If you have already edited one of those files, it keeps your version and tells you. Pass `--registry` to install from somewhere else, which takes a url or a directory.

## Requirements

Node 20.11 or later, and Tailwind CSS v4 in the project you are adding to. React 19 or Vue 3.5.

## Docs

[sley-ui.dev](https://sley-ui.dev) carries the component set, the design language and a running demo application. The switch above its sidebar rewrites every code block for the framework you pick, and [sley-ui.dev/docs/vue](https://sley-ui.dev/docs/vue) carries the rules that take the props from one to the other.

## Licence

MIT. Isfaaq M. F. Emambocus.
