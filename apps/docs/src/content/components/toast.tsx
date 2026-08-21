import { Button } from '@/components/ui/button/Button'
import { toaster } from '@demo/toaster'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const ToastDemo = () => (
  <Demo caption="Raise a few at once. They stack, and the group holds the highest rank in the document.">
    <Button
      onClick={() =>
        toaster.create({
          title: '12 runs are queued for export',
          description: 'A link follows when the archive is written.',
          type: 'success',
        })
      }
    >
      Success
    </Button>
    <Button
      onClick={() => toaster.create({ title: 'R-4818 failed on the flow cell', type: 'error' })}
    >
      Error
    </Button>
    <Button
      onClick={() =>
        toaster.create({
          title: 'R-4819 is cancelled',
          description: 'The instrument has stopped, and the reads stay on the run.',
          type: 'warning',
        })
      }
    >
      Warning
    </Button>
    <Button onClick={() => toaster.create({ title: 'Watching R-4814', type: 'info' })}>Info</Button>
    <Button onClick={() => toaster.create({ title: 'Writing the archive', type: 'loading' })}>
      Loading
    </Button>
  </Demo>
)

const Notes = () => (
  <>
    <P>
      A toast is a status line, not a banner. The dye dot plus the title is the same treatment the
      status column uses, so a run that fails looks the same whether you read it in the table or in a
      toast. Zag names five types and each one maps to a dye: jade, madder, weld, indigo, and the dim
      weft for loading, whose dot beats.
    </P>
    <P>
      Zag gives the group the maximum rank inline, so no token here ranks it. That is correct: a
      toast has to be visible above a modal, and a modal is the highest thing this system defines.
    </P>
    <P>
      Create the toaster once, at the root of your application, and import it wherever something
      needs to say so. Mount <Code>Toaster</Code> once beside it.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'toast',
  name: 'Toast',
  summary: 'A status line in the corner, with the dye dot the status column uses.',
  exports: ['Toaster', 'createToaster'],
  vueImports: [
    "import Toaster from '@/components/ui/toast/Toaster.vue'",
    "import { createToaster } from '@ark-ui/vue/toast'",
  ],
  Demo: ToastDemo,
  api: [
    {
      name: 'toaster',
      type: 'CreateToasterReturn',
      required: true,
      detail: 'The instance from createToaster. Make one at the root and import it everywhere.',
    },
    { name: 'title', type: 'string', detail: 'On the create call. It truncates rather than wrapping.' },
    { name: 'description', type: 'string', detail: 'On the create call. A second line under the title.' },
    {
      name: 'type',
      type: "'success' | 'error' | 'warning' | 'info' | 'loading'",
      detail: 'Chooses the dye. Loading beats until you replace or remove it.',
    },
  ],
  Notes,
}
