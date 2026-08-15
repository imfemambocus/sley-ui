export interface ApiRow {
  readonly name: string
  readonly type: string
  readonly required?: boolean
  readonly detail: string
}

interface ApiProps {
  readonly rows: readonly ApiRow[]
  readonly caption?: string
}

export const Api = ({ rows, caption }: ApiProps) => (
  <div className="max-w-3xl overflow-x-auto border border-reed bg-raised">
    <table className="w-full border-collapse text-left align-top">
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead>
        <tr className="reed-edge">
          <th scope="col" className="px-4 py-2 font-medium text-weft-dim">
            Prop
          </th>
          <th scope="col" className="px-4 py-2 font-medium text-weft-dim">
            Type
          </th>
          <th scope="col" className="px-4 py-2 font-medium text-weft-dim">
            What it does
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name} className="border-t border-reed/60">
            <td className="px-4 py-2 align-top font-data whitespace-nowrap text-weft">
              {row.name}
              {row.required && <span className="pl-1.5 text-madder">*</span>}
            </td>
            <td className="px-4 py-2 align-top font-data text-[12px] text-indigo">{row.type}</td>
            <td className="max-w-md px-4 py-2 align-top text-weft-dim">{row.detail}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
