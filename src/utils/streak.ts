export function getCurrentStreak(days: string[]): number {
  if (!days.length) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (days.includes(key)) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export function getLast7Days(days: string[]): { date: string, hasFocus: boolean, isToday: boolean }[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    return {
      date: key,
      hasFocus: days.includes(key),
      isToday: i === 6,
    }
  })
}