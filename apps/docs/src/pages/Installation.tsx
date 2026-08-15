import { CodeBlock } from '../site/CodeBlock'
import { Code, Lede, List, Note, P, PageTitle, Section } from '../site/Prose'

export const Installation = () => (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>Installation</PageTitle>
      <Lede>
        Two commands. The first reads your project and writes the tokens, the second writes a
        component and everything it imports.
      </Lede>
    </header>

    <Section id="requirements" title="What you need first">
      <List>
        <li>
          React 19 and Tailwind CSS v4. The token layer is written in <Code>@theme</Code>, which is a
          v4 feature.
        </li>
        <li>
          A Vite or a Next project. <Code>init</Code> detects which one you have and writes the alias
          into the files that framework actually resolves through.
        </li>
        <li>
          Archivo and IBM Plex Mono, however you like to load a font. Nothing breaks without them,
          but the type pair is half the identity.
        </li>
      </List>
    </Section>

    <Section id="init" title="Run init once">
      <CodeBlock shell code="npx sley-ui init" />
      <P>
        It finds your framework, your path alias and the stylesheet that pulls Tailwind in. Then it
        writes the whole token block as a file of its own and imports it from that stylesheet. It
        also writes <Code>components.json</Code>, which is shadcn&apos;s config file rather than one
        of mine, so a project that uses both CLIs needs one file and not two.
      </P>
      <P>
        On a Vite project it inserts the alias into <Code>tsconfig.app.json</Code> and a{' '}
        <Code>resolve.alias</Code> block into <Code>vite.config.ts</Code>, because the tsconfig alone
        does not tell Vite anything. If your config already has a <Code>resolve</Code> block it
        prints the line to add rather than guessing where to put it. Next needs neither, since{' '}
        <Code>create-next-app</Code> already declares the alias.
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
        table gives you <Code>cx</Code>, the icons, the checkbox, the empty state, the tooltip and the
        figure, because that is what the table is built out of. No component declares its
        dependencies by hand: the build script reads the imports out of the source, so a header
        nobody maintains cannot go stale.
      </P>
      <P>
        If a file already on disk differs from the version you installed, it is kept and marked with
        an exclamation mark rather than replaced. Pass <Code>--overwrite</Code> when you want mine
        back.
      </P>
    </Section>

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

    <Section id="options" title="Options">
      <CodeBlock
        code={`--cwd <dir>          the project directory
--registry <source>  a url, or a local directory
--overwrite          replace a file you edited
--no-install         skip the npm install`}
      />
      <P>
        <Code>--registry</Code> takes a directory as well as a url, which is what makes the whole CLI
        testable with no network at all.
      </P>
    </Section>
  </article>
)
