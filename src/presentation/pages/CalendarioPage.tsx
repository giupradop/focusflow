import { useEffect, useState } from 'react'
import { useTaskStore } from '../store/useTaskStore'

const DAYS_PT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MONTHS_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

const EV_COLORS: Record<string, { bg: string, color: string }> = {
  'trabalho':          { bg: '#0c2340', color: '#85B7EB' },
  'faculdade':         { bg: '#1a2e10', color: '#97C459' },
  'saúde e bem estar': { bg: '#0a2820', color: '#5DCAA5' },
  'formação pessoal':  { bg: '#4B1528', color: '#ED93B1' },
  'projetos pessoais': { bg: '#1e1a3a', color: '#AFA9EC' },
}

export function CalendarioPage() {
  const { tasks, loadWeek } = useTaskStore()
  const [calMonth, setCalMonth] = useState(new Date())

  useEffect(() => { loadWeek(0) }, [])

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
      return t.dueDate.getDate() === day && t.dueDate.getMonth() === m && t.dueDate.getFullYear() === y
    })
  }

  const navBtn: React.CSSProperties = {
    background: 'transparent', border: '.5px solid rgba(255,255,255,0.15)',
    borderRadius: 6, color: '#888', padding: '6px 14px',
    cursor: 'pointer', fontSize: 15,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* header */}
      <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: '.5px solid rgba(255,255,255,0.08)', background: '#1a1a1a', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 500 }}>{MONTHS_PT[m]} {y}</h1>
            <p style={{ fontSize: 15, color: '#888', marginTop: 4 }}>visualize suas entregas</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => changeMonth(-1)} style={navBtn}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#2a2a2a'; el.style.color = '#f0f0f0' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = '#888' }}
            >←</button>
            <button
              onClick={() => changeMonth(1)} style={navBtn}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#2a2a2a'; el.style.color = '#f0f0f0' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = '#888' }}
            >→</button>
          </div>
        </div>
      </div>

      <div style={{ padding: '1.5rem 1.75rem', flex: 1 }}>

        {/* cabeçalho dias */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {DAYS_PT.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 12, color: '#888', textTransform: 'uppercase', padding: '6px 0' }}>{d}</div>
          ))}
        </div>

        {/* grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>

          {/* dias mês anterior */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`prev-${i}`} style={{ minHeight: 88, background: '#222', borderRadius: 8, border: '.5px solid rgba(255,255,255,0.08)', padding: 8, opacity: 0.3 }}>
              <div style={{ fontSize: 13, color: '#888' }}>{prevMonthDays - firstDay + i + 1}</div>
            </div>
          ))}

          {/* dias mês atual */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dt = new Date(y, m, day)
            dt.setHours(0, 0, 0, 0)
            const isToday = dt.getTime() === today.getTime()
            const dayTasks = getTasksForDay(day)

            return (
              <div
                key={day}
                style={{
                  minHeight: 88, background: '#222', borderRadius: 8, padding: 8,
                  border: `.5px solid ${isToday ? '#993556' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <div style={{ fontSize: 13, marginBottom: 4, color: isToday ? '#D4537E' : '#888', fontWeight: isToday ? 500 : 400 }}>
                  {day}
                </div>
                {dayTasks.slice(0, 3).map(t => {
                  const ev = EV_COLORS[t.category] ?? { bg: '#333', color: '#888' }
                  return (
                    <div
                      key={t.id}
                      style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, marginBottom: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', background: ev.bg, color: ev.color }}
                    >
                      {t.name}
                    </div>
                  )
                })}
                {dayTasks.length > 3 && (
                  <div style={{ fontSize: 11, color: '#888' }}>+{dayTasks.length - 3}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}