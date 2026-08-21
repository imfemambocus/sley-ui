# Install Sley UI here, in Vue

A Vite and Vue app with Tailwind and nothing else in it. It exists so you can run the install
commands and watch what they do, on a project that is not yours.

https://stackblitz.com/github/imfemambocus/sley-ui/tree/main/examples/blank-vue?file=src%2FApp.vue

Open the terminal and run:

```sh
npx sley-ui init
npx sley-ui add table
```

`init` reads `vue` out of the dependencies and takes the Vue tree of the registry from then on. It
takes about a second. `add table` takes longer, because it installs the packages the components
import.

`src/App.vue` carries a small table example at the bottom, commented out. Paste it over the rest of
the file once the second command has finished. Note the `#cell-` slots: a Vue column is data, and
the cell markup lives in your template.

If you want the finished version instead, that is `examples/starter-vue`.

## Worth knowing about the config

`tsconfig.app.json` inlines its options rather than extending `@vue/tsconfig`, which is what a fresh
Vite template does. The preset is a package, and this directory is not installed by the repository it
sits in, so extending it made the repository's own lint fail on a clean checkout. Nothing else about
the project changes.
