<script setup lang="ts">
/*
 * plain tailwind on purpose: this project has no sley ui in it yet, so it can carry
 * none of the tokens. after init runs, the palette below is what the page picks up.
 */

const STEPS = [
  {
    command: 'npx sley-ui init',
    detail:
      'Reads this project, sees that it is Vue, writes the token file and imports it from the stylesheet. The @ alias is already in the Vite config and the tsconfig here, so it says so and leaves them alone.',
  },
  {
    command: 'npx sley-ui add table',
    detail:
      'Writes the table and everything it imports into src/components/ui as single file components, then installs what those files need.',
  },
]
</script>

<template>
  <div class="min-h-dvh bg-[#0b0d14] px-6 py-16 text-[#f2f1ec]">
    <div class="mx-auto flex max-w-2xl flex-col gap-8">
      <header class="flex flex-col gap-3">
        <p class="font-mono text-[11px] tracking-[0.18em] text-[#f2f1ec]/40 uppercase">An empty project</p>
        <h1 class="text-3xl font-semibold tracking-tight">Install Sley UI and watch it work.</h1>
        <p class="text-[#f2f1ec]/60">
          This is a Vite and Vue app with Tailwind and nothing else. Open the terminal below and run
          these two commands. Nothing here is your repository, so there is nothing to undo.
        </p>
      </header>

      <ol class="flex flex-col gap-4">
        <li
          v-for="(step, index) in STEPS"
          :key="step.command"
          class="flex gap-4 border-t border-[#f2f1ec]/10 pt-4"
        >
          <span class="font-mono text-sm text-[#5f72ef]">{{ index + 1 }}</span>
          <div class="flex flex-col gap-2">
            <code class="font-mono text-sm text-[#f2f1ec]">{{ step.command }}</code>
            <p class="text-sm text-[#f2f1ec]/60">{{ step.detail }}</p>
          </div>
        </li>
      </ol>

      <p class="text-sm text-[#f2f1ec]/60">
        Watch the file tree on the left as they run. When they finish, open src/App.vue and replace
        it with the block at the bottom of this file to see the table you just installed.
      </p>
    </div>
  </div>
</template>

<!--
  paste this over everything above once `add table` has finished.

  <script setup lang="ts">
  import Table, { type Column } from '@/components/ui/table/Table.vue'

  interface Row {
    readonly id: string
    readonly sample: string
    readonly reads: number
  }

  const rows: readonly Row[] = [
    { id: 'R-4821', sample: 'LCS-0912-A', reads: 412.8 },
    { id: 'R-4820', sample: 'LCS-0912-B', reads: 398.4 },
    { id: 'R-4819', sample: 'LCS-0911-C', reads: 61.2 },
  ]

  const columns: readonly Column<Row>[] = [
    { key: 'id', label: 'Run', chars: 8, sortValue: (r) => r.id },
    { key: 'sample', label: 'Sample', chars: 12, sortValue: (r) => r.sample },
    { key: 'reads', label: 'Reads', unit: 'M', chars: 7, numeric: true, sortValue: (r) => r.reads },
  ]
  </script>

  <template>
    <div class="min-h-dvh bg-ground p-6 text-weft">
      <Table :rows="rows" :columns="columns" :row-id="(row: Row) => row.id" title="Runs" :noun="['run', 'runs']">
        <template #cell-id="{ row }">{{ row.id }}</template>
        <template #cell-sample="{ row }">{{ row.sample }}</template>
        <template #cell-reads="{ row }">{{ row.reads.toFixed(1) }}</template>
      </Table>
    </div>
  </template>
-->
