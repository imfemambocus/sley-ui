import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button/Button'
import { RunConsole } from '../console/RunConsole'
import { CodeBlock } from '../site/CodeBlock'
import { SANDBOX } from '../site/Header'
import { Link } from '../site/router'
import { Segmented } from '../site/Segmented'
import { DENSITIES, useDensityValues, useSettings } from '../site/settings'

const DensityStrip = () => {
  const { density, setDensity } = useSettings()
  const values = useDensityValues(density)

  return (
    <section className="border border-reed bg-raised">
      <div className="reed-edge flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-weft">One knob, six numbers</p>
          <p className="text-weft-dim">
            It retunes the chart and the table below, the controls above them, and this page.
          </p>
        </div>
        <Segmented legend="Density" options={DENSITIES} value={density} onSelect={setDensity} />
      </div>
      <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {values.map((token) => (
          <div key={token.name} className="warp-line flex flex-col gap-0.5 px-4 py-3 first:before:hidden">
            <dt className="font-data text-[12px] text-weft-faint">{token.name}</dt>
            <dd className="tnum font-data text-[15px] text-weft">{token.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

interface PitchProps {
  readonly title: string
  readonly children: ReactNode
}

const Pitch = ({ title, children }: PitchProps) => (
  <div className="flex flex-col gap-2 border-t border-reed pt-5">
    <h3 className="font-ui text-[17px] font-semibold tracking-[-0.02em] text-weft">{title}</h3>
    <p className="text-prose text-weft-dim">{children}</p>
  </div>
)

export const Home = () => (
  <div className="flex flex-col">
    <section className="relative overflow-hidden">
      <div className="warp-field pointer-events-none absolute inset-x-0 top-0 h-64 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="relative mx-auto flex max-w-360 flex-col gap-8 px-4 pt-20 pb-14 sm:px-6">
        <p className="font-data text-[11px] tracking-[0.18em] text-weft-faint uppercase">
          A React component registry
        </p>
        <h1 className="max-w-4xl font-ui text-[clamp(34px,6vw,60px)] leading-[1.04] font-bold tracking-[-0.04em] text-weft">
          Components for interfaces that hold a lot of data.
        </h1>
        <p className="max-w-2xl text-prose text-weft-dim">
          Tables, filter bars, command palettes, side panels and long forms. I built Sley UI because
          every library I reached for was designed for a marketing page: right with eight elements on
          a screen, and at two hundred the padding eats the viewport. So I started from the dense
          case instead. A chart sits beside them, drawn in plain SVG by Observable Plot, which puts
          it under the same tokens as everything else.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/docs/installation">
            <Button variant="primary">Get started</Button>
          </Link>
          <Link href="/components/table">
            <Button>Browse the components</Button>
          </Link>
        </div>
        <CodeBlock shell code={'npx sley-ui init\nnpx sley-ui add table'} className="max-w-sm" />
        <p className="text-weft-dim">
          <span>Or try it before you run anything: </span>
          <a
            href={SANDBOX}
            target="_blank"
            rel="noreferrer"
            className="text-indigo underline underline-offset-4 transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft"
          >
            open a working app in your browser
          </a>
          <span>. It boots a Vite project with the components already installed, in a new tab.</span>
        </p>
      </div>
      <div className="reed-band h-0.5 w-full" />
    </section>

    <section className="mx-auto flex w-full max-w-360 flex-col gap-6 px-4 py-14 sm:px-6">
      <DensityStrip />
      <RunConsole />
    </section>

    <section className="mx-auto grid w-full max-w-360 gap-x-12 gap-y-8 px-4 pb-8 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
      <Pitch title="Density is the design problem">
        Three modes on the root element, and six custom properties behind them. Row height, cell
        padding, control height, text size, stack gap and the pitch of the reed all move together, so
        nothing drifts out of step with anything else. It costs no JavaScript.
      </Pitch>
      <Pitch title="The numbers are the content">
        Digits after the decimal point read one step back. A missing value is one tick of the reed
        rather than a hyphen. A value under its threshold carries the reed under its own digits, and
        the units live in the column head where they are stated once.
      </Pitch>
      <Pitch title="It holds at volume too">
        Past a hundred rows the table renders only what the viewport holds, and two spacers keep the
        scrollbar honest. The density scale already fixes the row height, so the window is arithmetic
        rather than measurement: no dependency, and nothing to configure.
      </Pitch>
      <Pitch title="You own the code">
        A command copies the source into your project and you keep it. The lockfile records the
        version and the hash of every file it wrote, so an update merges my changes into yours
        instead of overwriting them.
      </Pitch>
    </section>
  </div>
)
