import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button/Button'
import { EmptyState } from '@/components/ui/empty-state/EmptyState'
import {
  Field,
  FieldError,
  FieldHint,
  FieldInput,
  FieldLabel,
  FieldSet,
  FieldTextarea,
} from '@/components/ui/field/Field'
import { Elapsed, Figure } from '@/components/ui/figure/Figure'
import { Panel } from '@/components/ui/panel/Panel'
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs/Tabs'
import type { Run } from './runs'
import { toaster } from './toaster'
import { stamp } from './format'
import { STATUS_TONE } from './status'
import { Q30_FLOOR } from './columns'

interface DetailProps {
  readonly label: string
  readonly children: ReactNode
}

const Detail = ({ label, children }: DetailProps) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-reed/60 py-1.5">
    <dt className="text-weft-dim">{label}</dt>
    <dd className="tnum text-weft">{children}</dd>
  </div>
)

const Overview = ({ run }: { readonly run: Run }) => (
  <dl className="flex flex-col">
    <Detail label="Sample">
      <span className="font-data">{run.sample}</span>
    </Detail>
    <Detail label="Assay">
      <span className="font-data">{run.assay}</span>
    </Detail>
    <Detail label="Status">
      <span className={`inline-flex items-center gap-1.5 ${STATUS_TONE[run.status]}`}>
        <span className="size-1.25 rounded-full bg-current" />
        <span className="font-data">{run.status}</span>
      </span>
    </Detail>
    <Detail label="Started">
      <span className="font-data">{stamp(run.started).full}</span>
    </Detail>
    <Detail label="Elapsed">
      <span className="font-data">
        <Elapsed minutes={run.duration} />
      </span>
    </Detail>
    {/* a person, not a machine value: no data face */}
    <Detail label="Owner">{run.owner}</Detail>
  </dl>
)

const Metrics = ({ run }: { readonly run: Run }) => {
  if (run.reads === 0) {
    return (
      <EmptyState
        title="No metrics yet"
        description="The run has produced no reads."
        action={
          <Button
            variant="quiet"
            onClick={() => toaster.create({ title: `Watching ${run.id}`, description: 'A toast follows the first read.', type: 'info' })}
          >
            Tell me when it starts
          </Button>
        }
      />
    )
  }

  return (
    <dl className="flex flex-col">
      <Detail label="Reads (M)">
        <span className="font-data">
          <Figure value={run.reads} />
        </span>
      </Detail>
      <Detail label="Q30 (%)">
        <span className="font-data">
          <Figure value={run.q30} low={run.q30 < Q30_FLOOR} />
        </span>
      </Detail>
      <Detail label="Coverage (x)">
        <span className="font-data">
          <Figure value={run.coverage} />
        </span>
      </Detail>
    </dl>
  )
}

const Reassign = ({ run }: { readonly run: Run }) => {
  const [owner, setOwner] = useState(run.owner)
  const [note, setNote] = useState('')

  return (
    <FieldSet legend="Reassign the run">
      <Field required invalid={owner.trim() === ''}>
        <FieldLabel>New owner</FieldLabel>
        <FieldInput value={owner} onChange={(event) => setOwner(event.target.value)} />
        <FieldHint>The person who answers for the result.</FieldHint>
        <FieldError>Name the person who takes the run.</FieldError>
      </Field>

      <Field>
        <FieldLabel>Note</FieldLabel>
        <FieldTextarea value={note} onChange={(event) => setNote(event.target.value)} />
        <FieldHint>The note goes on the run, and the current owner reads it.</FieldHint>
      </Field>

      <div className="flex justify-end">
        <Button
          variant="primary"
          disabled={owner.trim() === ''}
          onClick={() =>
            toaster.create({ title: `${run.id} goes to ${owner.trim()}`, type: 'success' })
          }
        >
          Save
        </Button>
      </div>
    </FieldSet>
  )
}

interface RunPanelProps {
  readonly run: Run | null
  readonly onClose: () => void
  readonly onCancelRun: (run: Run) => void
}

export const RunPanel = ({ run, onClose, onCancelRun }: RunPanelProps) => {
  /* the panel needs its run while it slides out */
  const [shown, setShown] = useState(run)

  useEffect(() => {
    if (run !== null) setShown(run)
  }, [run])

  if (shown === null) return null

  return (
    <Panel
      open={run !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={shown.id}
      description={`${shown.assay} on ${shown.sample}`}
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Close
          </Button>
          <Button
            disabled={shown.status !== 'running' && shown.status !== 'queued'}
            onClick={() => onCancelRun(shown)}
          >
            Cancel the run
          </Button>
        </>
      }
    >
      {/* the key remounts the tabs and the form for another run */}
      <Tabs key={shown.id} defaultValue="overview" className="flex flex-col">
        <TabsList className="px-(--cell-x)">
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="metrics">Metrics</TabsTab>
          <TabsTab value="notes">Notes</TabsTab>
        </TabsList>
        <TabsPanel value="overview" className="px-(--cell-x)">
          <Overview run={shown} />
        </TabsPanel>
        <TabsPanel value="metrics" className="px-(--cell-x)">
          <Metrics run={shown} />
        </TabsPanel>
        <TabsPanel value="notes" className="px-(--cell-x)">
          <Reassign run={shown} />
        </TabsPanel>
      </Tabs>
    </Panel>
  )
}
