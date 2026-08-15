/* code unit order. a report and an install line must not follow the machine's locale. */
export function byCodeUnit(a: string, b: string) {
  if (a < b) return -1
  return a > b ? 1 : 0
}
