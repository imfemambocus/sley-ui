const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function stamp(iso: string) {
  const [date, time] = iso.split('T')
  const [year, month, day] = date.split('-')
  return { short: `${day} ${MONTHS[Number(month) - 1]} ${time}`, full: `${day} ${MONTHS[Number(month) - 1]} ${year}, ${time}` }
}
