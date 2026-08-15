import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs/Tabs'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const TabsDemo = () => (
  <Demo className="w-full max-w-lg" caption="The mark slides between tabs. It does not move on the first render.">
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="metrics">Metrics</TabsTab>
        <TabsTab value="notes">Notes</TabsTab>
        <TabsTab value="audit" disabled>
          Audit
        </TabsTab>
      </TabsList>
      <TabsPanel value="overview" className="text-weft-dim">
        RNA-seq on LCS-0911-C, started 12 Aug at 09:30, owned by M. Haas.
      </TabsPanel>
      <TabsPanel value="metrics" className="text-weft-dim">
        61.2M reads at 91.4% Q30. Coverage is not meaningful for this assay.
      </TabsPanel>
      <TabsPanel value="notes" className="text-weft-dim">
        No note has been left on this run.
      </TabsPanel>
      <TabsPanel value="audit" className="text-weft-dim">
        Nobody can read this tab.
      </TabsPanel>
    </Tabs>
  </Demo>
)

const Notes = () => (
  <>
    <P>
      The mark under the selected tab is the selvedge turned a quarter. A list of choices that runs
      across gets its finished edge along the bottom rather than down the side, and it is the same
      reed at the same pitch, so it thickens and thins with the density like everything else.
    </P>
    <P>
      Zag places and animates it, and it reads two names out of the stylesheet:{' '}
      <Code>--transition-duration</Code> and <Code>--transition-timing-function</Code>. The{' '}
      <Code>.tab-mark</Code> class sets them to <Code>--dur-local</Code> and{' '}
      <Code>--ease-beat</Code>. Zag also keeps the transition off until the first tab change, so the
      mark does not fly in from the left on load.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'tabs',
  name: 'Tabs',
  summary: 'A tab list whose mark is the selvedge, laid on its side.',
  exports: ['Tabs', 'TabsList', 'TabsTab', 'TabsPanel'],
  Demo: TabsDemo,
  api: [
    { name: 'defaultValue', type: 'string', detail: 'Which tab starts open, when you are not controlling it.' },
    { name: 'value', type: 'string', detail: 'Controlled. Pair it with onValueChange.' },
    { name: 'onValueChange', type: '(details: { value: string }) => void', detail: "Ark's shape, passed through." },
    { name: 'value (tab)', type: 'string', required: true, detail: 'Ties a tab to its panel.' },
    { name: 'disabled (tab)', type: 'boolean', detail: 'Skipped by the keyboard and dimmed, and its panel cannot be reached.' },
  ],
  measured: [
    {
      value: '0.16s',
      what: 'The mark sliding from one tab to the next',
      detail: 'On --ease-beat, which leaves fast and settles without a bounce.',
    },
  ],
  Notes,
}
