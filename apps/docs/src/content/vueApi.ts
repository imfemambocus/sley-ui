import type { ApiRow } from '../site/Api'

/*
 * the four rules the vue page states, applied to a react props table so the two
 * cannot drift. a component whose vue api differs for a real reason declares its
 * own vueApi instead and never reaches this.
 */

const kebab = (name: string) => name.replaceAll(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

/* onCheckedChange models `checked`, and onBrush models `brush`. neither suffix is guaranteed. */
function modelled(name: string, props: ReadonlySet<string>) {
  if (!name.startsWith('on') || name.length < 3) return null
  const rest = name[2].toLowerCase() + name.slice(3)
  const bare = rest.endsWith('Change') ? rest.slice(0, -'Change'.length) : rest
  return props.has(bare) ? bare : null
}

function convert(row: ApiRow, props: ReadonlySet<string>, models: ReadonlySet<string>): ApiRow | null {
  if (row.name === 'className') return { ...row, name: 'class' }

  /* a react spread of the native props is attribute fallthrough, which needs no declaration */
  if (row.name.startsWith('...')) {
    return { ...row, name: 'any native attribute', type: 'fallthrough' }
  }

  if (models.has(row.name)) {
    return { ...row, name: `v-model:${row.name}`, detail: `${row.detail} Bind it and its event separately to transform the value on the way back.` }
  }

  /* the callback of a model is that model's own event, and the row above already carries it */
  if (modelled(row.name, props) !== null) return null

  if (row.name.startsWith('on')) {
    return { ...row, name: `@${kebab(row.name.slice(2))}`.replace('@-', '@') }
  }

  if (row.type === 'ReactNode') {
    if (row.name === 'children') return { ...row, name: 'default slot', type: 'slot' }
    return { ...row, name: `#${row.name}`, type: 'slot' }
  }

  return row
}

export function toVueApi(rows: readonly ApiRow[]): readonly ApiRow[] {
  const props = new Set(rows.map((row) => row.name))
  const models = new Set(rows.map((row) => modelled(row.name, props)).filter((name) => name !== null))

  return rows.map((row) => convert(row, props, models)).filter((row) => row !== null)
}
