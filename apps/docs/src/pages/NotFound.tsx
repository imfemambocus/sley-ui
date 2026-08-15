import { Button } from '@/components/ui/button/Button'
import { EmptyState } from '@/components/ui/empty-state/EmptyState'
import { Link } from '../site/router'
import { PageTitle } from '../site/Prose'

export const NotFound = () => (
  <div className="flex flex-col gap-8">
    <PageTitle>Nothing here</PageTitle>
    <EmptyState
      title="This page does not exist"
      description="It may have been renamed while the library is still early."
      action={
        <Link href="/">
          <Button>Back to the overview</Button>
        </Link>
      }
    />
  </div>
)
