export function calculateEarnedMinutes(durationSeconds: number, ratio: number): number {
  if (ratio <= 0) throw new Error('Ratio deve ser maior que zero')
  if (durationSeconds <= 0) return 0
  return Math.ceil(durationSeconds / 60 / ratio)
}

export function formatLeisureBalance(minutes: number): string {
  if (minutes <= 0) return '0m'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${h}h ${rest}m` : `${h}h`
}