import { CodeBlock } from '../site/CodeBlock'
import { Code, Lede, Note, P, PageTitle, Section } from '../site/Prose'

export const Updates = () => (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>Updates</PageTitle>
      <Lede>
        The copy-in model has no good answer to updates. This is mine, and it is the part of the
        project I care most about getting right.
      </Lede>
    </header>

    <Section id="problem" title="The problem with owning the code">
      <P>
        Once a component is in your repository it is yours. You rename something, you add a column
        type, you fix a bug I have not seen yet. That is the whole point of copying source in rather
        than depending on a package. It is also why nobody can ship you a fix afterwards: a registry
        that writes over your file destroys your work, and a registry that refuses to write leaves
        you on an old version forever.
      </P>
    </Section>

    <Section id="lockfile" title="What the lockfile records">
      <P>
        Every write puts an entry in <Code>sley.lock</Code>: the registry version, the url it came
        from, and a sha256 for each file. The hash is of the file as it landed on disk, not of the
        JSON the registry sent, because your alias prefix and the client directive both change the
        content on the way in. A hash of the registry copy would report every file as edited on the
        very next run.
      </P>
      <CodeBlock
        code={`"table": {
  "version": "0.1.0",
  "url": "https://sley-ui.dev/r/0.1.0/table.json",
  "files": [
    { "path": "components/ui/table/Table.tsx", "hash": "sha256-..." }
  ]
}`}
      />
      <P>
        The entry moves only when every file of an item was written. A partial write would record a
        base that no file on disk ever came from, and the merge reads that base as its truth.
      </P>
    </Section>

    <Section id="versioned" title="Why the url carries a version">
      <P>
        A merge needs three inputs: what I shipped then, what I ship now, and what you have. The
        first one is the hard part, because a flat registry path only ever holds the newest release.
        So every published version keeps its own path, frozen and immutable, beside the flat one that
        always points at the latest.
      </P>
      <CodeBlock
        code={`/r/table.json          the newest, and what add installs
/r/0.1.0/table.json    the exact bytes of that release, forever`}
      />
      <Note>
        A frozen version cannot be republished with different content. The build refuses it and asks
        for a version rise, because a lockfile names files by hash, and moving the bytes under a
        version would report every file as edited on somebody else&apos;s machine.
      </Note>
    </Section>

    <Section id="merge" title="What the merge does">
      <P>
        <Code>sley update</Code> fetches two things: the version your lockfile names, from its frozen
        path, and the newest one. With your file on disk that makes the three inputs, and the rest is
        a line-based diff3 written into the CLI. There is no shell out to git, because the one feature
        that defines this tool should not need another tool installed to work.
      </P>
      <CodeBlock
        code={`npx sley-ui update            every item in the lockfile
npx sley-ui update table      one of them
npx sley-ui update --dry-run  what would change, writing nothing`}
      />
      <P>
        Four things can happen to a file. If you never touched it, it takes the new version outright.
        If I did not touch it, yours stays exactly as you wrote it. If we both did, the merge runs. If
        you deleted it, the item stops and tells you. A file I add is written, and a file I drop is
        reported and never deleted, because your code may still import it.
      </P>
      <P>
        An item moves whole or not at all. A half-written item would record a base that no file on
        disk ever came from, and every later update would read that base as the truth.
      </P>
    </Section>

    <Section id="conflicts" title="When we edit the same lines">
      <P>
        Nothing is written. The command names the files that need you to decide and stops. Your
        project still builds. Passing <Code>--conflicts</Code> writes the usual markers into those
        files instead, which is the escape hatch when you would rather resolve it in your editor.
      </P>
      <Note>
        With the markers written, the lock moves too. It has to: if the base stayed at the old
        version, the file you resolved by hand would conflict against it again on every later run, and
        the item could never advance. I got that wrong first, and only found it by running the real
        command against a real second release.
      </Note>
    </Section>

    <Section id="status" title="Where this stands">
      <P>
        Built and published in <Code>sley-ui@0.2.0</Code>. I wrote the hashes in from the first
        release rather than retrofitting them, so nobody who installed early is left without a base to
        merge against, and the merge has been run across three real releases on this registry: a
        project sitting on an older version, carrying its own edits to a substantially rewritten file,
        came out with both my changes and its own and still compiled.
      </P>
    </Section>
  </article>
)
