import type { FC } from 'react'
import type { ApiRow } from '../site/Api'
import type { Measurement } from '../site/Measured'

export interface ComponentDoc {
  /* the registry item name, and the last part of the url */
  readonly slug: string
  readonly name: string
  readonly summary: string
  readonly exports: readonly string[]
  readonly Demo: FC
  readonly api: readonly ApiRow[]
  readonly measured?: readonly Measurement[]
  readonly Notes?: FC
}
