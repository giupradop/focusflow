export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return '0m'
  const m = Math.round(minutes)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest ? `${h}h ${rest}m` : `${h}h`
}

export function formatSeconds(seconds: number): string {
  const negative = seconds < 0
  seconds = Math.abs(Math.round(seconds))
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const result = h > 0
    ? `${pad(h)}:${pad(m)}:${pad(s)}`
    : `${pad(m)}:${pad(s)}`
  return negative ? `-${result}` : result
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}