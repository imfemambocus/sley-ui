import type { ComponentDoc } from '../content/types'
import { Api } from '../site/Api'
import { CodeBlock } from '../site/CodeBlock'
import { Measured } from '../site/Measured'
import { Lede, PageTitle, Section } from '../site/Prose'

function fileName(slug: string) {
  return slug
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
}

function importLine(doc: ComponentDoc) {
  const from = `'@/components/ui/${doc.slug}/${fileName(doc.slug)}'`
  if (doc.exports.length <= 4) return `import { ${doc.exports.join(', ')} } from ${from}`
  return `import {\n${doc.exports.map((name) => `  ${name},`).join('\n')}\n} from ${from}`
}

export const ComponentPage = ({ doc }: { readonly doc: ComponentDoc }) => (
  <article className="flex flex-col gap-14">
    <header className="flex flex-col gap-5">
      <PageTitle>{doc.name}</PageTitle>
      <Lede>{doc.summary}</Lede>
      <div className="flex flex-col gap-3">
        <CodeBlock shell code={`npx sley-ui add ${doc.slug}`} />
        <CodeBlock code={importLine(doc)} />
      </div>
    </header>

    <doc.Demo />

    {doc.Notes && (
      <Section id="behaviour" title="How it behaves">
        <doc.Notes />
      </Section>
    )}

    <Section id="props" title="Props">
      <Api rows={doc.api} caption={`The props ${doc.name} takes`} />
    </Section>

    {doc.measured && (
      <Section id="measured" title="Measured">
        <Measured rows={doc.measured} />
      </Section>
    )}
  </article>
)
