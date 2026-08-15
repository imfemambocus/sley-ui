import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/Dialog'
import type { Run } from '../data/runs'

interface CancelDialogProps {
  readonly run: Run | null
  readonly onClose: () => void
  readonly onConfirm: (run: Run) => void
}

export const CancelDialog = ({ run, onClose, onConfirm }: CancelDialogProps) => {
  /* the dialog leaves before it goes, so it keeps the run it asked about until it is gone */
  const [shown, setShown] = useState(run)

  useEffect(() => {
    if (run !== null) setShown(run)
  }, [run])

  if (shown === null) return null

  return (
    <Dialog
      open={run !== null}
      role="alertdialog"
      onOpenChange={(details) => {
        if (!details.open) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel {shown.id}?</DialogTitle>
          <DialogDescription>
            The instrument stops, and the reads it has written stay on the run.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="quiet">Keep the run</Button>
          </DialogClose>
          <Button variant="danger" onClick={() => onConfirm(shown)}>
            Cancel the run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
