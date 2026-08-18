/*
 * plain tailwind on purpose: this project has no sley ui in it yet, so it can carry
 * none of the tokens. after init runs, the palette below is what the page picks up.
 */

const STEPS = [
  {
    command: 'npx sley-ui init',
    detail:
      'Reads this project, writes the token file, imports it from the stylesheet, and adds the @ alias to the tsconfig and to the Vite config.',
  },
  {
    command: 'npx sley-ui add table',
    detail: 'Writes the table and everything it imports into src/components/ui, then installs what those files need.',
  },
]

export const App = () => (
  <div className="min-h-dvh bg-[#0b0d14] px-6 py-16 text-[#f2f1ec]">
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-[11px] tracking-[0.18em] text-[#f2f1ec]/40 uppercase">An empty project</p>
        <h1 className="text-3xl font-semibold tracking-tight">Install Sley UI and watch it work.</h1>
        <p className="text-[#f2f1ec]/60">
          This is a Vite and React app with Tailwind and nothing else. Open the terminal below and run these two
          commands. Nothing here is your repository, so there is nothing to undo.
        </p>
      </header>

      <ol className="flex flex-col gap-4">
        {STEPS.map((step, index) => (
          <li key={step.command} className="flex gap-4 border-t border-[#f2f1ec]/10 pt-4">
            <span className="font-mono text-sm text-[#5f72ef]">{index + 1}</span>
            <div className="flex flex-col gap-2">
              <code className="font-mono text-sm text-[#f2f1ec]">{step.command}</code>
              <p className="text-sm text-[#f2f1ec]/60">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-sm text-[#f2f1ec]/60">
        Watch the file tree on the left as they run. When they finish, open src/App.tsx and replace it with the block
        at the bottom of this file to see the table you just installed.
      </p>
    </div>
  </div>
)

/*
 * paste this over everything above once `add table` has finished.
 *
 * import { Table, type Column } from '@/components/ui/table/Table'
 *
 * interface Row {
 *   readonly id: string
 *   readonly sample: string
 *   readonly reads: number
 * }
 *
 * const rows: readonly Row[] = [
 *   { id: 'R-4821', sample: 'LCS-0912-A', reads: 412.8 },
 *   { id: 'R-4820', sample: 'LCS-0912-B', reads: 398.4 },
 *   { id: 'R-4819', sample: 'LCS-0911-C', reads: 61.2 },
 * ]
 *
 * const columns: readonly Column<Row>[] = [
 *   { key: 'id', label: 'Run', chars: 8, sortValue: (r) => r.id, render: (r) => r.id },
 *   { key: 'sample', label: 'Sample', chars: 12, sortValue: (r) => r.sample, render: (r) => r.sample },
 *   { key: 'reads', label: 'Reads', unit: 'M', chars: 7, numeric: true, sortValue: (r) => r.reads, render: (r) => r.reads.toFixed(1) },
 * ]
 *
 * export const App = () => (
 *   <div className="min-h-dvh bg-ground p-6 text-weft">
 *     <Table rows={rows} columns={columns} rowId={(row) => row.id} title="Runs" noun={['run', 'runs']} />
 *   </div>
 * )
 */
