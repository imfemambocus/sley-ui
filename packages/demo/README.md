# Demo domain

The sequencing run data and the views built on it. The lab and the docs site both import it, so the
two demonstrations cannot drift apart.

Nothing here is published. It resolves through the `@demo` alias, which each app declares in its
`vite.config.ts` and its `tsconfig.json`, beside the `@` alias that reaches the registry source.

Three rows are ragged on purpose. One sample id runs longer than its column, one owner name carries
an umlaut, and one reads value has four digits. They are what the truncation, the sort and the
column widths are tested against.
