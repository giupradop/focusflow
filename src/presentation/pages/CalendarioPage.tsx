import { useEffect, useState } from 'react'
import { useTaskStore } from '../store/useTaskStore'

const DAYS_PT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MONTHS_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

const EV_CLS: Record<string, string> = {
  'trabalho': 'bg-[#0c2340] text-[#85B7EB]',
  'faculdade': 'bg-[#1a2e10] text-[#97C459]',
  'saúde e bem estar': 'bg-[#0a2820] text-[#5DCAA5]',
  'formação pessoal': 'bg-[var(--pink-900)] text-[var(--pink-200)]',
  'projetos pessoais': 'bg-[#1e1a3a] text-[#AFA9EC]',
}

export function CalendarioPage() {
  const { tasks, loadWeek } = useTaskStore()
  const [calMonth, setCalMonth] = useState(new Date())

  useEffect(() => {
    loadWeek(0)
  }, [])

  const y = calMonth.getFullYear()
  const m = calMonth.getMonth()
  const firstDay = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const prevMonthDays = new Date(y, m, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  function changeMonth(dir: number) {
    setCalMonth(new Date(y, m + dir, 1))
  }

  function getTasksForDay(day: number) {
    return tasks.filter(t => {
      if (t.archived) return false
      const dd = t.dueDate
      return dd.getDate() === day && dd.getMonth() === m && dd.getFullYear() === y
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-7 pt-6 pb-4 border-b border-[var(--border)] bg-[var(--bg)] sticky top-0 z-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-medium">{MONTHS_PT[m]} {y}</h1>
            <p className="text-sm text-[var(--muted)] mt-1">visualize suas entregas</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="px-3 py-1.5 rounded-lg border border-[var(--border2)] bg-transparent text-[var(--muted)] hover:bg-[var(--bg3)] hover:text-[var(--text)] cursor-pointer text-sm">←</button>
            <button onClick={() => changeMonth(1)} className="px-3 py-1.5 rounded-lg border border-[var(--border2)] bg-transparent text-[var(--muted)] hover:bg-[var(--bg3)] hover:text-[var(--text)] cursor-pointer text-sm">→</button>
          </div>
        </div>
      </div>

      <div className="px-7 py-6 flex-1">
        {/* cabeçalho dos dias */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS_PT.map(d => (
            <div key={d} className="text-center text-xs text-[var(--muted)] uppercase py-2">{d}</div>
          ))}
        </div>

        {/* grid do calendário */}
        <div className="grid grid-cols-7 gap-1">
          {/* dias do mês anterior */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`prev-${i}`} className="min-h-[80px] bg-[var(--bg2)] rounded-lg border border-[var(--border)] p-1.5 opacity-30">
              <div className="text-xs text-[var(--muted)]">{prevMonthDays - firstDay + i + 1}</div>
            </div>
          ))}

          {/* dias do mês atual */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dt = new Date(y, m, day)
            dt.setHours(0, 0, 0, 0)
            const isToday = dt.getTime() === today.getTime()
            const dayTasks = getTasksForDay(day)

            return (
              <div
                key={day}
                className={`min-h-[80px] bg-[var(--bg2)] rounded-lg border p-1.5 ${isToday ? 'border-[var(--pink-500)]' : 'border-[var(--border)]'}`}
              >
                <div className={`text-xs mb-1 ${isToday ? 'text-[var(--pink-400)] font-medium' : 'text-[var(--muted)]'}`}>
                  {day}
                </div>
                {dayTasks.slice(0, 3).map(t => (
                  <div
                    key={t.id}
                    className={`text-[10px] px-1.5 py-0.5 rounded mb-0.5 truncate ${EV_CLS[t.category] ?? 'bg-[var(--bg4)] text-[var(--muted)]'}`}
                  >
                    {t.name}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-[var(--muted)]">+{dayTasks.length - 3}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}