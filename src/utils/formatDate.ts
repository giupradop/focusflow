export function formatDate(date: Date): string {
  const d = date.getDate()
  const m = date.getMonth() + 1
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}

export function formatShortDate(date: Date): string {
  const d = date.getDate()
  const m = date.getMonth() + 1
  return `${d}/${m}`
}

export function parseDate(value: string): Date | null {
  if (!value || value === '—') return null
  const parts = value.split('/')
  if (parts.length !== 3) return null
  const d = parseInt(parts[0])
  const m = parseInt(parts[1]) - 1
  const y = parseInt(parts[2])
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null
  return new Date(y, m, d)
}

export function today(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString()
}