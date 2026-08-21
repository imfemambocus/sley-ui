import { CodeBlock, FrameworkBlock } from '../site/CodeBlock'
import { SANDBOX, SANDBOX_BLANK, SANDBOX_BLANK_VUE, SANDBOX_VUE } from '../site/Header'
import { Code, Lede, List, Note, P, PageTitle, Section } from '../site/Prose'
import { Link } from '../site/router'
import { useSettings } from '../site/settings'

const REACT_FILES = `components.json                           init, and shared with shadcn
sley.lock                                 init, and updated by every add
styles/tokens.css                         init, imported from your stylesheet

components/ui/table/Table.tsx             add table
components/ui/checkbox/Checkbox.tsx
components/ui/empty-state/EmptyState.tsx
components/ui/icons/Icons.tsx
components/ui/tooltip/Tooltip.tsx
lib/cx.ts`

const VUE_FILES = `components.json                           init, and shared with shadcn
sley.lock                                 init, and updated by every add
styles/tokens.css                         init, imported from your stylesheet

components/ui/table/Table.vue             add table
components/ui/table/ColumnHead.vue
components/ui/table/ColumnGrip.vue
components/ui/checkbox/Checkbox.vue
components/ui/empty-state/EmptyState.vue
components/ui/icons/CheckIcon.vue
components/ui/icons/ChevronIcon.vue
components/ui/icons/CloseIcon.vue
components/ui/icons/SearchIcon.vue
components/ui/tooltip/Tooltip.vue
lib/cx.ts`

const DOC_LINK =
  'text-indigo underline underline-offset-4 transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft'

export const Installation = () => {
  const { framework } = useSettings()
  const vue = framework === 'vue'
  const sandbox = vue ? SANDBOX_VUE : SANDBOX
  const blank = vue ? SANDBOX_BLANK_VUE : SANDBOX_BLANK

  return (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>Installation</PageTitle>
      <Lede>
        Two commands. The first reads your project and writes the tokens, the second writes a
        component and everything it imports.
      </Lede>
    </header>

    <Section id="sandbox" title="Try it without installing anything">
      <P>
        <a
          href={sandbox}
          target="_blank"
          rel="noreferrer"
          className="text-indigo underline underline-offset-4 transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft"
        >
          This sandbox
        </a>
        <span>
          {' '}
          opens in a new tab and boots a Vite project with Sley UI already in it, with nothing to
          install and nothing to undo. It is a real install rather than a copy of the library: it
          carries its own{' '}
        </span>
        <Code>sley.lock</Code>
        <span>, so you can run the update command inside it too.</span>
      </P>
      <P>
        <span>If it is the commands themselves you would rather not take on trust, </span>
        <a
          href={blank}
          target="_blank"
          rel="noreferrer"
          className="text-indigo underline underline-offset-4 transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft"
        >
          this one starts empty
        </a>
        <span>
          {' '}
          and opens in a new tab. It is a Vite app with Tailwind and nothing else, and you run the two
          commands below in its terminal and watch the files arrive. Both were run there on a real
          container: <Code>init</Code> takes about a second, and <Code>add</Code> takes longer because
          it installs what the components import.
        </span>
      </P>
    </Section>

    <Section id="requirements" title="What you need first">
      <List>
        <li>
          {vue ? 'Vue 3.5' : 'React 19'} and Tailwind CSS v4. The token layer is written in{' '}
          <Code>@theme</Code>, which is a v4 feature.
        </li>
        <li>
          {vue ? (
            <span>
              A Vite project or a Nuxt one, and the CLI at <Code>0.3.0</Code> or newer, because
              earlier versions know only React. Nuxt wants <Code>0.4.0</Code>.
            </span>
          ) : (
            <span>
              A Vite or a Next project. <Code>init</Code> detects which one you have and writes the
              alias into the files that framework actually resolves through.
            </span>
          )}
        </li>
        <li>
          Archivo and IBM Plex Mono, however you like to load a font. Nothing breaks without them,
          but the type pair is half the identity.
        </li>
      </List>
      <Note>
        <span>
          Both frameworks are one registry at one version, and <Code>init</Code> picks the tree out of
          your dependencies. The four rules that carry every prop from one to the other are on the{' '}
        </span>
        <Link href="/docs/vue" className={DOC_LINK}>
          Vue page
        </Link>
        <span>.</span>
      </Note>
    </Section>

    <Section id="init" title="Run init once">
      <CodeBlock shell code="npx sley-ui init" />
      <P>
        It finds your framework, your path alias and the stylesheet that pulls Tailwind in. Then it
        writes the whole token block as a file of its own and imports it from that stylesheet. It
        also writes <Code>components.json</Code>, which is shadcn&apos;s config file rather than one
        of mine. A project that uses both CLIs needs one file and not two.
      </P>
      <P>
        <span>
          On a Vite project it inserts the alias into <Code>tsconfig.app.json</Code> and a{' '}
          <Code>resolve.alias</Code> block into <Code>vite.config.ts</Code>, because the tsconfig
          alone does not tell Vite anything. If your config already has a <Code>resolve</Code> block
          it prints the line to add rather than guessing where to put it.
        </span>
        {vue ? (
          <span>
            {' '}
            A <Code>create-vue</Code> template ships both already, and <Code>init</Code> then says so
            and leaves them alone. Nuxt declares its own <Code>@</Code> and keeps it in a generated
            file, so there the run edits no config at all.
          </span>
        ) : (
          <span>
            {' '}
            Next needs neither, since <Code>create-next-app</Code> already declares the alias.
          </span>
        )}
      </P>
      <Note>
        The whole token file ships at init, not a fragment for each component. A per-component
        fragment has no stable position in your stylesheet, and the three way merge behind{' '}
        <Code>update</Code> would not be able to find it again later.
      </Note>
    </Section>

    <Section id="add" title="Then add what you need">
      <CodeBlock shell code={'npx sley-ui add table\nnpx sley-ui add dialog panel toast'} />
      <P>
        Dependencies come with it, and they are written before the file that imports them. Adding the
        table gives you <Code>cx</Code>, the icons, the checkbox, the empty state and the tooltip,
        because that is what the table is built out of. No component declares its dependencies by
        hand. The build script reads the imports out of the source, which keeps a hand-written
        header from going stale and gives each framework its own Ark package in the same pass.
      </P>
      <P>
        If a file already on disk differs from the version you installed, it is kept and marked with
        an exclamation mark rather than replaced. Pass <Code>--overwrite</Code> when you want mine
        back.
      </P>
    </Section>

    <Section id="written" title="What lands in your project">
      <P>
        Everything is a file you can read, and every path is relative to whatever your alias points
        at, so a Vite project with <Code>@</Code> on <Code>src</Code> gets them under{' '}
        <Code>src</Code>. Running the two commands above leaves this:
      </P>
      <FrameworkBlock react={REACT_FILES} vue={VUE_FILES} />
      <P>
        Three npm packages arrive with that set: <Code>clsx</Code> and <Code>tailwind-merge</Code>{' '}
        for <Code>cx</Code>, and <Code>{vue ? '@ark-ui/vue' : '@ark-ui/react'}</Code> for the parts
        built on a state machine. The table itself declares none. Pass <Code>--no-install</Code> and
        it writes the files and leaves your package manager alone.
      </P>
      <P>
        The version in the lockfile is the registry version, not the version of the CLI you ran. It
        names the release of the components you installed, and npm carries its own number for the
        tool, so the two move separately. If you open an issue, give me both: the registry version
        out of <Code>sley.lock</Code>, and the CLI version from{' '}
        <Code>npx sley-ui --version</Code>.
      </P>
      <Note>
        Nothing here is a dependency on Sley UI. Delete <Code>sley.lock</Code> and the files stay
        exactly as they are, and keep working. The lockfile is what <Code>update</Code> reads, so
        deleting it costs you the merge and nothing else.
      </Note>
    </Section>

    {!vue && (
    <Section id="next" title="A note for Next">
      <P>
        A component that uses a hook gets a <Code>&apos;use client&apos;</Code> directive, and only in
        a Next project. An Ark import counts, because Ark is built on hooks. The icons and{' '}
        <Code>cx</Code> stay server safe and get nothing.
      </P>
      <P>
        One thing crosses no server boundary: a column definition holds a <Code>render</Code>{' '}
        function, so a page that declares its columns has to be a client component. The components
        themselves work from a server component.
      </P>
    </Section>
    )}

    <Section id="options" title="Options">
      <CodeBlock
        code={`--cwd <dir>          the project directory
--framework <name>   react or vue, when your dependencies name both
--registry <source>  a url, or a local directory
--overwrite          replace a file you edited
--conflicts          on update, write the conflict markers into the file
--dry-run            on update, report what would change and write nothing
--no-install         skip the npm install`}
      />
      <P>
        <Code>--registry</Code> takes a directory as well as a url, which is what makes the whole CLI
        testable with no network at all.
      </P>
    </Section>
  </article>
  )
}
