import { useEffect, useState } from 'react'
import { Demo } from '../site/Demo'
import { Code, Lede, Note, P, PageTitle, Section } from '../site/Prose'
import { useSettings } from '../site/settings'

interface Swatch {
  readonly token: string
  readonly what: string
}

const SURFACES: readonly Swatch[] = [
  { token: '--color-ground', what: 'The page. The indigo warp held right back, or warm paper in the light theme.' },
  { token: '--color-raised', what: 'A card, a table, a layer that sits on the page.' },
  { token: '--color-sunken', what: 'A code block, a well, anything set into the page.' },
  { token: '--color-shed', what: 'Where the reader is: a hovered row, a highlighted option.' },
  { token: '--color-reed', what: 'A divider, a border, the ticks in the reed.' },
  { token: '--color-reed-lit', what: 'The edge of a floating layer, and a border under the pointer.' },
]

const INK: readonly Swatch[] = [
  { token: '--color-weft', what: 'Body text. Warm ecru on the dark theme, cool near-black on the light one.' },
  { token: '--color-weft-dim', what: 'A label, a secondary line, a column head.' },
  { token: '--color-weft-faint', what: 'A unit, a placeholder, a keyboard hint.' },
]

const DYES: readonly Swatch[] = [
  { token: '--color-indigo', what: 'Focus, selection, the active state. The dye the project is named for.' },
  { token: '--color-indigo-wash', what: 'The selected surface. A dyed row rather than a highlighted one.' },
  { token: '--color-jade', what: 'Complete, success. Not a generic green.' },
  { token: '--color-madder', what: 'Failed, danger, a value under its threshold.' },
  { token: '--color-weld', what: 'A warning. The yellow you get from the weld plant.' },
]

/* the swatch prints what the browser actually resolved, so the theme cannot lie about it */
function useResolved(tokens: readonly string[], theme: string) {
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const style = getComputedStyle(document.documentElement)
    const next: Record<string, string> = {}
    tokens.forEach((token) => {
      next[token] = style.getPropertyValue(token).trim()
    })
    setValues(next)
  }, [tokens, theme])

  return values
}

interface PaletteProps {
  readonly heading: string
  readonly swatches: readonly Swatch[]
}

const Palette = ({ heading, swatches }: PaletteProps) => {
  const { theme } = useSettings()
  const values = useResolved(
    swatches.map((swatch) => swatch.token),
    theme,
  )

  return (
    <div className="border border-reed bg-raised">
      <p className="reed-edge px-4 py-2 font-data text-[11px] tracking-[0.13em] text-weft-faint uppercase">
        {heading}
      </p>
      <ul className="flex flex-col">
        {swatches.map((swatch) => (
          <li
            key={swatch.token}
            className="flex items-center gap-4 border-t border-reed/60 px-4 py-3 first:border-t-0"
          >
            <span
              className="size-9 shrink-0 border border-reed-lit"
              style={{ backgroundColor: `var(${swatch.token})` }}
            />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="flex flex-wrap items-baseline gap-3">
                <span className="font-data text-weft">{swatch.token.replace('--color-', '')}</span>
                <span className="tnum font-data text-[12px] text-indigo">{values[swatch.token]}</span>
              </span>
              <span className="text-weft-dim">{swatch.what}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ContrastDemo = () => (
  <Demo caption="Warm ink on a cool ground. Switch the theme in the header: the relationship survives the inversion.">
    <div className="flex flex-col gap-1">
      <p className="text-weft">The weft is the thread that crosses the warp.</p>
      <p className="text-weft-dim">It always carries the opposite temperature to the ground.</p>
      <p className="text-weft-faint">Three steps, and no fourth.</p>
    </div>
  </Demo>
)

export const ColourPage = () => (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>Colour</PageTitle>
      <Lede>
        Warm ink on a cool ground, and three natural dyes instead of a generic success green. Every
        name comes from the loom.
      </Lede>
    </header>

    <Section id="signature" title="The chromatic signature">
      <P>
        The ground is the indigo warp, held right back until it is almost black but still cool. The
        weft is the undyed thread that reads on top of it, which is a warm ecru rather than white.
        That pairing is the thing I would keep if I had to throw the rest away. A dark interface in
        neutral grey with white text is the most copied look in this ecosystem, and it is the reason
        so many libraries are indistinguishable at a glance.
      </P>
      <ContrastDemo />
    </Section>

    <Palette heading="Surfaces" swatches={SURFACES} />
    <Palette heading="Ink" swatches={INK} />
    <Palette heading="Dyes" swatches={DYES} />

    <Section id="dyes" title="Why they are dyes">
      <P>
        Jade, madder and weld are three of the colours you get out of a dye pot, and they are what
        this system calls complete, failed and warning. Naming them for the dye rather than the
        meaning keeps a component from inventing a fourth semantic colour when it wants a slightly
        different green.
      </P>
      <Note>
        Status reads as a 5px dot plus a word, never a filled pill. A pill costs vertical space that
        the dense mode does not have, and a filled block competes with the label next to it. The
        same rule is why a count in a control is a plain mono numeral with no fill behind it.
      </Note>
    </Section>

    <Section id="light" title="The light theme is a real theme">
      <P>
        It is not the dark palette with the lightness flipped. The ground goes to a warm paper and the
        ink goes to a cool near-black, which is the same warm and cool pairing turned the other way
        round. The shadow under a floating layer is a soft brown rather than a soft black, because a
        black shadow on paper looks like dirt.
      </P>
      <P>
        Both live in <Code>tokens.css</Code>, and the components reference the semantic name only.
        Switching theme changes one attribute on the root element.
      </P>
    </Section>
  </article>
)
