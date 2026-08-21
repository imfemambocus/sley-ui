import type { MovedFile, ReleaseEntry } from '../content/types'
import { LATEST, RELEASES } from '../content/releases.generated'
import { RELEASE_NOTES } from '../content/releases'
import { CodeBlock } from '../site/CodeBlock'
import { Code, Lede, Note, P, PageTitle, Section } from '../site/Prose'

interface Move extends MovedFile {
  readonly kind: 'added' | 'changed' | 'removed'
}

const TONE: Record<Move['kind'], string> = {
  added: 'text-jade',
  changed: 'text-weld',
  removed: 'text-madder',
}

function moves(release: ReleaseEntry): readonly Move[] {
  return [
    ...release.added.map((file) => ({ ...file, kind: 'added' as const })),
    ...release.changed.map((file) => ({ ...file, kind: 'changed' as const })),
    ...release.removed.map((file) => ({ ...file, kind: 'removed' as const })),
  ]
}

const FileRow = ({ move }: { readonly move: Move }) => (
  <li className="flex items-baseline gap-2.5 border-t border-reed/60 px-4 py-2 first:border-t-0">
    <span className={`size-1.25 shrink-0 translate-y-[-2px] rounded-full bg-current ${TONE[move.kind]}`} />
    <span className={`w-18 shrink-0 ${TONE[move.kind]}`}>{move.kind}</span>
    <span className="font-data text-[12px] break-all text-weft-dim">{move.path}</span>
  </li>
)

const Release = ({ release }: { readonly release: ReleaseEntry }) => {
  const note = RELEASE_NOTES[release.version]
  const moved = moves(release)

  return (
    <section id={release.version} className="flex scroll-mt-28 flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="tnum font-data text-[19px] text-weft">{release.version}</h2>
        {release.version === LATEST && (
          <span className="selvedge selvedge-on bg-raised py-0.5 pr-2 pl-2 text-weft-dim">latest</span>
        )}
        <time className="tnum font-data text-[12px] text-weft-faint" dateTime={note.date}>
          {note.date}
        </time>
      </div>

      <h3 className="font-ui text-[17px] font-medium">{note.title}</h3>
      <P>{note.body}</P>

      {moved.length > 0 ? (
        <ul className="max-w-3xl border border-reed bg-raised">
          {moved.map((move) => (
            <FileRow key={`${move.kind}-${move.path}`} move={move} />
          ))}
        </ul>
      ) : (
        <p className="tnum max-w-2xl text-prose text-weft-dim">
          {release.items} items, {release.files} files.
        </p>
      )}
    </section>
  )
}

export const Releases = () => (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>Releases</PageTitle>
      <Lede>
        Every version the registry serves, what moved in each one, and why it moved. The list is built
        from the frozen bundles, so it cannot describe a release differently from the files you install.
      </Lede>
    </header>

    <Section id="pinning" title="Reading this page">
      <P>
        Every release keeps its own immutable path beside the flat one, so a version on this page can
        be installed on its own and stays byte for byte what it was. <Code>sley update</Code> reads the
        old version from that path when it merges, which is why they are kept rather than replaced.
      </P>
      <CodeBlock
        code={`npx sley-ui add table                                         the newest
npx sley-ui add table --registry https://sley-ui.dev/r/0.1.0  that release`}
      />
      <Note>
        One version number covers all nineteen items in both frameworks, so a rise does not mean every
        component moved. <Code>sley update</Code> leaves a file that did not move exactly as you wrote
        it, and a path under <Code>vue/</Code> is the Vue copy of that item.
      </Note>
    </Section>

    {RELEASES.map((release) => (
      <Release key={release.version} release={release} />
    ))}
  </article>
)
