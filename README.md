<!--
  banner slot: a 1280x360 light and dark pair behind a <picture>, built by banner.mjs.
  it goes in here once the design language exists.
-->

Sley UI is a component registry for React. It covers the interfaces that hold a lot of data: tables, filter bars, command palettes, side panels and long forms.

The components are not an npm dependency. A command copies the source files into your project. You own the code from that point. You can read it, change it, and keep your changes.

## Install

```sh
npx sley-ui init
npx sley-ui add table
```

Install it globally and the command shortens to `sley`.

`init` reads your project. It finds the framework, the path alias and the stylesheet that pulls Tailwind in, then writes the token block as a file of its own. Vite and Next are both supported. `add` writes a component and everything it imports. If you have already edited one of those files, it keeps your version and tells you.

## Why

Most component libraries target marketing pages. They look correct with eight elements on a screen, and they break down with two hundred. Sley UI starts from the opposite case. Density is the design problem, and every component answers to it.

One attribute on the root element moves every component between three densities: comfortable, compact and dense. Row height, control height, padding and label size all change together, so nothing drifts out of step. It is CSS custom properties, so it costs no JavaScript.

Sley UI uses Ark UI for behaviour and Tailwind CSS v4 for the token layer. Each component is readable TypeScript. There is no runtime style engine.

## Updates

You own the code, so a normal registry cannot update it. Sley UI records the source hash of every file that it writes. The `update` command does a three way merge across the old registry version, the new registry version, and your edited file. Your changes stay.

## Status

Early development. The design language is settled, and three components are built on it. `init` and `add` work on a fresh Vite app and a fresh Next app. Neither the package nor the registry is published yet, so the commands above do not run outside this repo. The full component set, `update` and the docs site come next. Expect breaking changes.

## Licence

MIT. Isfaaq M. F. Emambocus.
