import type { ComponentDoc } from '../content/types'
import { Api } from '../site/Api'
import { CodeBlock, FrameworkBlock } from '../site/CodeBlock'
import { Measured } from '../site/Measured'
import { Code, Note, PageTitle, Lede, Section } from '../site/Prose'
import { Link } from '../site/router'
import { useSettings } from '../site/settings'

function fileName(slug: string) {
  return slug
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
}

function reactImport(doc: ComponentDoc) {
  const from = `'@/components/ui/${doc.slug}/${fileName(doc.slug)}'`
  if (doc.exports.length <= 4) return `import { ${doc.exports.join(', ')} } from ${from}`
  return `import {\n${doc.exports.map((name) => `  ${name},`).join('\n')}\n} from ${from}`
}

/* a vue item is one export to one file, so the import list is the export list */
function vueImport(doc: ComponentDoc) {
  if (doc.vueImports) return doc.vueImports.join('\n')

  const dir = `@/components/ui/${doc.slug}`
  const components = doc.exports.filter((name) => !name.startsWith('type '))
  const types = doc.exports.filter((name) => name.startsWith('type '))

  return components
    .map((name, index) => {
      const path = `'${dir}/${name}.vue'`
      if (index > 0 || types.length === 0) return `import ${name} from ${path}`
      return `import ${name}, { ${types.join(', ')} } from ${path}`
    })
    .join('\n')
}

export const ComponentPage = ({ doc }: { readonly doc: ComponentDoc }) => {
  const { framework } = useSettings()

  return (
    <article className="flex flex-col gap-14">
      <header className="flex flex-col gap-5">
        <PageTitle>{doc.name}</PageTitle>
        <Lede>{doc.summary}</Lede>
        <div className="flex flex-col gap-3">
          <CodeBlock shell code={`npx sley-ui add ${doc.slug}`} />
          <FrameworkBlock react={reactImport(doc)} vue={vueImport(doc)} />
        </div>
      </header>

      <doc.Demo />

      {doc.Notes && (
        <Section id="behaviour" title="How it behaves">
          <doc.Notes />
        </Section>
      )}

      <Section id="props" title="Props">
        <Api
          rows={framework === 'vue' ? (doc.vueApi ?? doc.api) : doc.api}
          caption={`The props ${doc.name} takes`}
        />
        {framework === 'vue' && doc.vueApi === undefined && (
          <Note>
            <span>
              The Vue component takes the same props under the same names, with four changes that
              hold across the whole set: <Code>className</Code> is <Code>class</Code>, a{' '}
              <Code>children</Code> prop is a slot, a controlled value with a change callback is a
              model, and anything else that reports is an event. The four are written out on the{' '}
            </span>
            <Link
              href="/docs/vue"
              className="text-indigo underline underline-offset-4 transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft"
            >
              Vue page
            </Link>
            <span>.</span>
          </Note>
        )}
      </Section>

      {doc.measured && (
        <Section id="measured" title="Measured">
          <Measured rows={doc.measured} />
        </Section>
      )}
    </article>
  )
}
