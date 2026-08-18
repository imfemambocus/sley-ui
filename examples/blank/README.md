# Install Sley UI here

A Vite and React app with Tailwind and nothing else in it. It exists so you can run the install
commands and watch what they do, on a project that is not yours.

https://stackblitz.com/github/imfemambocus/sley-ui/tree/main/examples/blank?file=src%2FApp.tsx

Open the terminal and run:

```sh
npx sley-ui init
npx sley-ui add table
```

Both were run in this environment on 2026-08-18. `init` takes about a second. `add table` takes
longer, because it installs the packages the components import.

`src/App.tsx` carries a small table example at the bottom, commented out. Paste it over the rest of
the file once the second command has finished.

If you want the finished version instead, that is `examples/starter`.
