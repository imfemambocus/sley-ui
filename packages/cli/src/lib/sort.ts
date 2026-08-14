/* code unit order, so a report and an install line do not follow the machine's locale */
export function byCodeUnit(a: string, b: string) {
  if (a < b) return -1
  return a > b ? 1 : 0
}
