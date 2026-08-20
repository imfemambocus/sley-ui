<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/banner-dark.png">
  <source media="(prefers-color-scheme: light)" srcset=".github/banner-light.png">
  <img src=".github/banner-dark.png" alt="Sley UI: components for interfaces that hold a lot of data." width="100%">
</picture>

## About

Sley UI is a component registry for React. It covers the interfaces that hold a lot of data: tables, filter bars, command palettes, side panels and long forms.

The components are not an npm dependency. A command copies the source files into your project. You own the code from that point. You can read it, change it, and keep your changes.

## Install

If you would rather see it working first, [open the starter in your browser](https://stackblitz.com/github/imfemambocus/sley-ui/tree/main/examples/starter?file=src%2FApp.tsx). It boots a Vite project with the components already in it, and there is nothing to install and nothing to undo. The same app is in `examples/starter` if you want it locally. If it is the commands you would rather not take on trust, [this sandbox starts empty](https://stackblitz.com/github/imfemambocus/sley-ui/tree/main/examples/blank?file=src%2FApp.tsx) and you run them yourself in its terminal.

```sh
npx sley-ui init
npx sley-ui add table
```

Install it globally and the command shortens to `sley`.

`init` reads your project. It finds the framework, the path alias and the stylesheet that pulls Tailwind in, then writes the token block as a file of its own. Vite and Next are both supported. `add` writes a component and everything it imports. If you have already edited one of those files, it keeps your version and tells you.

## Why

I build data-heavy internal tools for a living, and every component library I reached for was designed for a marketing page. They look right with eight elements on a screen. At two hundred the padding eats the viewport, the rows drift out of step with the controls beside them, and I spend more time overriding the library than using it.

So I started from the dense case. One attribute on the root element moves every component between comfortable, compact and dense. Row height, control height, padding and label size all move together. It is CSS custom properties, so it costs no JavaScript.

A narrow screen hides nothing. The table scrolls instead. Which columns matter is your call, not mine.

Past a hundred rows the table renders only what the viewport holds. Because the density scale fixes the row height, the window is arithmetic rather than measurement, so it needs no dependency and nothing to configure. A browser copes with a thousand rows on its own; this is the headroom above that.

A pointer costs the most in a dense table, so everything in one is reachable without it. Sorting, resizing a column, selection, moving from row to row, the command palette and the range on the chart all answer keys, and the docs page for it lists every binding I drove in a browser.

The chart is built on the same tokens as everything else. It reads the density knob and the palette, and it draws plain SVG, so your stylesheet reaches it and it needs no theme of its own. Drag across it to select a range, or tab to the plot and move an edge with the arrow keys. Either way it hands the values back to you, and that is how the demo on the home page narrows the table underneath it. A line with more points than the frame has pixels gets a cut that keeps its shape: in a fifty thousand point trace the one excursion survives, where taking every fiftieth reading reports the flat part it sits on. The measurements are on the chart page.

Underneath: Ark UI for behaviour, Tailwind CSS v4 for the token layer. Each component is readable TypeScript. There is no runtime style engine.

## Updates

You own the code, so a normal registry cannot update it. Sley UI records the source hash of every file that it writes, and the exact registry version it came from. Every published version keeps its own path on the registry, so the version you installed is still there a year later. The `update` command does a three way merge across the old registry version, the new registry version, and your edited file. Your changes stay.

Where your edit and mine land on the same lines, nothing is written. It tells you which files need you to decide, and `--conflicts` puts the usual markers in them so you can resolve them in your editor. `--dry-run` shows you the whole thing first.

What each version changed, and why, is written up at [sley-ui.dev/docs/releases](https://sley-ui.dev/docs/releases). That page is built from the frozen release bundles, so it describes the same files the command installs.

## Status

Early development. The design language is settled, and the component set is built on it: table, command palette, filter bar, field set, dialog, popover, toast, tabs, tooltip, select, panel and empty state, with a chart beside them. The docs site is live at [sley-ui.dev](https://sley-ui.dev), and it carries a running demo application. The registry is served from the same place, at version 0.7.0, and the CLI is on npm at 0.2.0, so every command above runs today on a fresh Vite app and a fresh Next app. The two version lines move separately: one names a release of the components, the other a release of the tool. Expect breaking changes. If something does not work, open an issue and give both numbers. The form asks for them.

To read the docs locally, clone this repo and run `npm install && npm run dev -w docs`.

## Licence

MIT. Isfaaq M. F. Emambocus.
