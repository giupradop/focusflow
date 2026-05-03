const STREAK_KEY = 'focusflow:streak'

export function recordFocusDay(): void {
  const today = new Date().toISOString().slice(0, 10)
  const days = loadStreakDays()
  if (!days.includes(today)) {
    days.push(today)
    localStorage.setItem(STREAK_KEY, JSON.stringify(days))
  }
}

export function loadStreakDays(): string[] {
  const raw = localStorage.getItem(STREAK_KEY)
  if (!raw) return []
  return JSON.parse(raw)
}

export function getCurrentStreak(): number {
  const days = loadStreakDays()
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

export function getLast7Days(): { date: string, hasFocus: boolean, isToday: boolean }[] {
  const days = loadStreakDays()
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