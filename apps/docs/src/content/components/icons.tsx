import { CheckIcon, ChevronIcon, CloseIcon, SearchIcon } from '@/components/ui/icons/Icons'
import { Demo } from '../../site/Demo'
import { Code, P } from '../../site/Prose'
import type { ComponentDoc } from '../types'

const ICONS = [
  { name: 'CheckIcon', Glyph: CheckIcon },
  { name: 'SearchIcon', Glyph: SearchIcon },
  { name: 'ChevronIcon', Glyph: ChevronIcon },
  { name: 'CloseIcon', Glyph: CloseIcon },
]

const IconsDemo = () => (
  <Demo caption="Four glyphs. Everything else you draw yourself, or bring an icon set you already like.">
    {ICONS.map(({ name, Glyph }) => (
      <div key={name} className="flex flex-col items-center gap-2">
        <Glyph className="size-5 text-weft" />
        <span className="font-data text-[12px] text-weft-faint">{name}</span>
      </div>
    ))}
  </Demo>
)

const Notes = () => (
  <>
    <P>
      This is not an icon set and it is not trying to become one. It is the four glyphs the
      components themselves need: the tick in a checkbox, the magnifier in a search field, the
      chevron on a select, and the cross on a close button. If you want an icon library, install the
      one you like. Nothing here will fight it.
    </P>
    <P>
      Each one takes <Code>currentColor</Code> and is marked <Code>aria-hidden</Code>, because in
      every place these are used the accessible name comes from the control around them.
    </P>
  </>
)

export const doc: ComponentDoc = {
  slug: 'icons',
  name: 'Icons',
  summary: 'The four glyphs the other components need, and nothing more.',
  exports: ['CheckIcon', 'SearchIcon', 'ChevronIcon', 'CloseIcon'],
  Demo: IconsDemo,
  api: [
    {
      name: 'className',
      type: 'string',
      detail: 'Size and colour it with utilities. Each glyph carries shrink-0 and inherits currentColor.',
    },
  ],
  Notes,
}
