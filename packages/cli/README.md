<img src="https://raw.githubusercontent.com/imfemambocus/sley-ui/main/.github/banner-light.png" alt="Sley UI: components for interfaces that hold a lot of data." width="100%">

## About

This is the command line tool for [Sley UI](https://sley-ui.dev), a component registry for React. It covers the interfaces that hold a lot of data: tables, filter bars, command palettes, side panels and long forms.

The components are not a dependency of your project. This tool copies the source files in, and you own them from that point.

## Use

```sh
npx sley-ui init
npx sley-ui add table
```

Install it globally and the command shortens to `sley`.

`init` reads your project. It finds the framework, the path alias and the stylesheet that pulls Tailwind in, then writes the token block as a file of its own. Vite and Next are both supported. `add` writes a component and everything it imports. If you have already edited one of those files, it keeps your version and tells you.

Pass `--registry` to install from somewhere else, which takes a url or a directory.

## Requirements

Node 20.11 or later, and Tailwind CSS v4 in the project you are adding to.

## Docs

[sley-ui.dev](https://sley-ui.dev) carries the component set, the design language and a running demo application.

## Licence

MIT. Isfaaq M. F. Emambocus.
