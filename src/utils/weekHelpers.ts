import { today } from './formatDate'

export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

export function getWeekRange(offset: number): { start: Date; end: Date } {
  const base = today()
  base.setDate(base.getDate() + offset * 7)
  return {
    start: getWeekStart(base),
    end: getWeekEnd(base),
  }
}

export function getWeekLabel(offset: number): string {
  if (offset === 0) return 'semana atual'
  if (offset === -1) return 'semana passada'
  if (offset === 1) return 'próxima semana'
  const { start, end } = getWeekRange(offset)
  const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`
  return `${fmt(start)} – ${fmt(end)}`
}