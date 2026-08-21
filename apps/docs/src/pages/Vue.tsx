import { CodeBlock } from '../site/CodeBlock'
import { SANDBOX_BLANK_VUE, SANDBOX_VUE } from '../site/Header'
import { Measured } from '../site/Measured'
import { Code, Lede, List, Note, P, PageTitle, Section } from '../site/Prose'
import { VueIsland } from '../site/VueIsland'
import { VUE_CONSOLE } from '../vue/demos'

const DOC_LINK =
  'text-indigo underline underline-offset-4 transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft'

const CELL_SLOTS = `<Table
  :rows="runs"
  :columns="columns"
  :row-id="(run) => run.id"
  title="Sequencing runs"
>
  <template #cell-id="{ row }">
    <span class="font-data">{{ row.id }}</span>
  </template>
  <template #cell-q30="{ row }">
    <Figure :value="row.q30" :low="row.q30 < 80" />
  </template>
  <template #actions>
    <Button>Export</Button>
  </template>
</Table>`

const COLUMNS = `const columns: readonly Column<Run>[] = [
  { key: 'id', label: 'Run', chars: 6, sortValue: (row) => row.id },
  {
    key: 'q30',
    label: 'Q30',
    unit: '%',
    chars: 4,
    numeric: true,
    sortValue: (row) => row.q30,
  },
]`

export const VuePage = () => (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>Vue</PageTitle>
      <Lede>
        The same components in a second framework. One token file, one version number, and the CLI
        reads which of the two trees you want out of your own dependencies.
      </Lede>
    </header>

    <Section id="why" title="Why there is a Vue set at all">
      <P>
        Ark UI, which every stateful component here is built on, is a layer of state machines with an
        adapter for each framework. That was the reason I picked it over the alternatives on day one,
        and it is the reason this port rewrote no behaviour: the parts, the props and the details
        objects are the same on both sides. What I actually wrote was the styling and the API.
      </P>
      <P>
        The token layer never moved at all. <Code>tokens.css</Code>, <Code>cx</Code> and the three
        chart helpers are the same bytes in both trees, served from one file. A density value or a
        palette change cannot land in one framework and not the other.
      </P>
    </Section>

    <Section id="requirements" title="What you need first">
      <List>
        <li>
          Vue 3.5 and Tailwind CSS v4. The token layer is written in <Code>@theme</Code>, which is a
          v4 feature.
        </li>
        <li>
          A Vite project or a Nuxt one. <Code>init</Code> reads which from your dependencies.
        </li>
        <li>
          The CLI at <Code>0.3.0</Code> or newer. Earlier versions know only React, and on a Vue
          project they would happily write the React files. Nuxt wants <Code>0.4.0</Code>.
        </li>
      </List>
    </Section>

    <Section id="commands" title="The commands are the same">
      <CodeBlock shell code={'npx sley-ui init\nnpx sley-ui add table'} />
      <P>
        <span>Or open a Vue project that already has them in it, </span>
        <a href={SANDBOX_VUE} target="_blank" rel="noreferrer" className={DOC_LINK}>
          in a new tab
        </a>
        <span>, and </span>
        <a href={SANDBOX_BLANK_VUE} target="_blank" rel="noreferrer" className={DOC_LINK}>
          this one starts empty
        </a>
        <span> if you would rather run the two commands yourself and watch the files arrive.</span>
      </P>
      <P>
        <Code>init</Code> looks for <Code>vue</Code> or <Code>react</Code> in your dependencies and
        reads the matching tree from then on. A repository that holds both refuses rather than
        guessing, and names the flag: <Code>--framework vue</Code>. The choice is recorded in{' '}
        <Code>sley.lock</Code>, which is how a bug report gets placed without anyone asking you.
      </P>
      <P>
        Underneath, React sits at the root of the registry and Vue in a tree under it, at{' '}
        <Code>/r/vue/</Code>. Every URL a React project already recorded is untouched by that, which
        is why the framework is in the path rather than in the item name. The version is one number
        for both: <Code>0.9.0</Code> names a release of the components, whichever framework you took
        them in.
      </P>
    </Section>

    <Section id="nuxt" title="On Nuxt">
      <P>
        Nuxt is the one project shape where <Code>init</Code> edits nothing. It declares{' '}
        <Code>~</Code> and <Code>@</Code> for you, both pointing at <Code>srcDir</Code>, and writes
        them into a generated tsconfig under <Code>.nuxt</Code> that nobody should be editing by
        hand. There is no alias to add and no bundler config to reach into. The run says as much. It
        prints the directory it resolved, writes the token file and the lockfile, and leaves{' '}
        <Code>tsconfig.json</Code> byte for byte as the template left it.
      </P>
      <P>
        <Code>srcDir</Code> is <Code>app/</Code> from Nuxt 4 and the project root before it, and a
        value you set in <Code>nuxt.config.ts</Code> wins over both. That is the directory the
        components land in. A Nuxt 4 project gets{' '}
        <Code>app/components/ui/table/Table.vue</Code> and a Nuxt 3 one gets it at the root, where
        the alias was pointing anyway.
      </P>
      <P>
        Two things follow from Nuxt itself and not from here. Its auto-import walks the components
        directory, and every file the CLI writes therefore picks up a global name like{' '}
        <Code>UiTableTable</Code> that you have no reason to use. The components also render on the
        server without complaint. I built a fresh Nuxt 4 app with the table on its page and read the
        markup back off the node server: the row count and the sort state were in the HTML before
        any script ran.
      </P>
    </Section>

    <Section id="props" title="How the props map">
      <P>
        Every prop keeps its name and its meaning. Four rules cover the difference, and they hold
        across the whole set. Read the props table on each component page through them.
      </P>
      <List>
        <li>
          <Code>className</Code> is <Code>class</Code>. It still goes last through <Code>cx</Code>,
          so a utility of yours still wins a Tailwind conflict.
        </li>
        <li>
          A <Code>children</Code> prop is the default slot, and a named node prop is a named slot:{' '}
          <Code>actions</Code> becomes <Code>#actions</Code> and <Code>footer</Code> becomes{' '}
          <Code>#footer</Code>.
        </li>
        <li>
          A controlled value with a change callback is a model. <Code>checked</Code> with{' '}
          <Code>onCheckedChange</Code> is <Code>v-model:checked</Code>; <Code>open</Code> with{' '}
          <Code>onOpenChange</Code> is <Code>v-model:open</Code>. Bind <Code>:open</Code> and{' '}
          <Code>@update:open</Code> separately when you need to transform the value on its way back.
        </li>
        <li>
          Anything else that reports is an event: <Code>onSelectionChange</Code> is{' '}
          <Code>@selection-change</Code>.
        </li>
      </List>
      <Note>
        A wrapper around an Ark root declares almost nothing, which lets every option Ark takes
        arrive as an attribute and spares me listing any of them twice. That is also why the Vue
        single file component compiler cannot type-check those. It refuses a props type imported
        from <Code>node_modules</Code> outright, and that is a real limit rather than a choice.
      </Note>
    </Section>

    <Section id="files" title="One export, one file">
      <P>
        A single file component holds one component. A compound control is therefore several files,
        and you import each by its path. There is no index file to re-export them from, which is why
        the two factory functions come from Ark directly: <Code>createListCollection</Code> from{' '}
        <Code>@ark-ui/vue/select</Code> and <Code>createToaster</Code> from{' '}
        <Code>@ark-ui/vue/toast</Code>. Ark is already in your <Code>package.json</Code> by then.
      </P>
      <P>
        Switch the framework above the sidebar and every import block on the documentation rewrites
        itself, including the ones on the component pages.
      </P>
    </Section>

    <Section id="table" title="The table takes its cells from a slot">
      <P>
        This is the one place the two APIs genuinely differ. In React a column carries a{' '}
        <Code>render</Code> function. In Vue a column is data, and the cell comes from a slot named
        after the column key. Your markup stays in a template where you can read it.
      </P>
      <CodeBlock code={COLUMNS} />
      <CodeBlock code={CELL_SLOTS} />
      <P>
        The slot props are typed, and <Code>row</Code> is your row type rather than{' '}
        <Code>any</Code>. A column with no slot draws an empty cell, which you see immediately,
        rather than a value that is quietly wrong.
      </P>
    </Section>

    <Section id="running" title="The whole console, running in Vue">
      <P>
        This is the demonstration from the overview, rendered by the Vue components rather than the
        React ones: the same fixture, the same tokens, the same twenty seven runs. Brush the chart to
        narrow the table, open a run, cancel it, and the toast that follows is the Vue one. Every
        component page runs its own demo the same way once you have picked Vue.
      </P>
      <VueIsland load={VUE_CONSOLE} />
      <Note>
        The site is a React application. A Vue demo is its own application mounted into one node of
        it, behind a dynamic import, which is why a reader who never asks for Vue never downloads
        it.
      </Note>
    </Section>

    <Section id="measured" title="Measured on the Vue build">
      <P>
        I drove the Vue set in a browser against the React one, reading the same numbers off both.
        These are the three that would have caught a port that only looked right.
      </P>
      <Measured
        rows={[
          {
            value: '40 / 32 / 25px',
            what: 'The row height at the three densities, read off a rendered cell',
            detail:
              'The same three values the React table gives, because the density scale is the same file. The knob is the whole thesis, so it is the first thing worth checking in a second framework.',
          },
          {
            value: '32,032px',
            what: 'The scroll height of a windowed table at 1000 rows',
            detail:
              'Exact: a thousand rows at 32px plus the head. At a scroll of 16,000px the first rendered row is 496, against an arithmetic 496, with 29 rows in the body. The window is the same arithmetic in both frameworks because the row height comes from the same token.',
          },
          {
            value: '25.8ms',
            what: 'The longest blocked frame when 5000 rows land in the Vue table',
            detail:
              'On the built site, three fresh loads: 23.9ms, 25.8ms and 27.1ms, with exactly one frame over 16.7ms in each. That is three frames on a 120Hz display. The React table reads 9.4ms by the same method, so the Vue commit costs two frames more and both are far from the 1.1 seconds the row window used to miss. The window itself is exact in both: aria-rowcount 5001, 25 rows drawn, and a scroll height of 200,040px.',
          },
          {
            value: '73.5kB',
            what: 'What switching this site to Vue downloads, gzipped',
            detail:
              'Read off the network panel on a component page: 22 chunks, of which 41.1kB is the Vue runtime and the rest is the Ark adapter and the demo. A reader who never asks for Vue never fetches any of it, because every demo is behind a dynamic import. The React side of the same page is 298.5kB.',
          },
          {
            value: '102 to 110 to 118px',
            what: 'A column width across two arrow presses on the resize grip',
            detail:
              'The column had flowed to 101.898px, so the first press rounds it to a whole pixel before adding the 8px step. A pointer drag then took it to 290px and moved neither neighbour, which is the spacer column doing its job.',
          },
        ]}
      />
    </Section>

    <Section id="left" title="What is not there yet">
      <List>
        <li>
          A Nuxt module. <Code>init</Code> writes the token file and imports it from the Tailwind
          stylesheet it finds, and it trusts Nuxt to be loading that stylesheet already. If your
          entry is not in the <Code>css</Code> array of <Code>nuxt.config.ts</Code>, the import lands
          in a file nothing reads and the page comes out unstyled.
        </li>
        <li>
          A Nuxt 3 build. The source directory rule covers its layout and there is a test on it, but
          the app I built and read the server markup out of was on Nuxt 4.
        </li>
      </List>
    </Section>
  </article>
)
