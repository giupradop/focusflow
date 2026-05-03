import { useEffect } from 'react'
import { useTaskStore } from '../store/useTaskStore'
import { useLeisureStore } from '../store/useLeisureStore'
import { formatMinutes } from '../../utils/formatTime'
import { getWeekRange } from '../../utils/weekHelpers'
import { formatShortDate } from '../../utils/formatDate'

export function ResumoPage() {
  const { tasks, loadWeek } = useTaskStore()
  const { bank, ratio, loadBank } = useLeisureStore()

  useEffect(() => {
    loadWeek(0)
    loadBank()
  }, [])

  const { start, end } = getWeekRange(0)
  const weekly = tasks.filter(t => t.createdAt >= start && t.createdAt <= end)
  const done = weekly.filter(t => t.status === 'concluída')
  const focusMin = done.reduce((a, t) => a + t.totalSpentSeconds / 60, 0)
  const earned = Math.ceil(focusMin / ratio)
  const rate = weekly.length ? Math.round(done.length / weekly.length * 100) : 0
  const balanceMin = bank?.balance.minutes ?? 0

  function getMessage() {
    if (weekly.length === 0) return 'nenhuma tarefa criada essa semana ainda. que tal começar agora?'
    if (rate >= 80) return `semana incrível! você concluiu ${rate}% das tarefas. continue assim — você está construindo algo sólido.`
    if (rate >= 50) return `boa semana! ${rate}% concluído. que tal planejar menos tarefas na próxima semana para aumentar a taxa?`
    return `semana desafiadora — ${rate}% concluído. não desanime. revise o que te travou e ajuste o plano.`
  }

  const border = '.5px solid rgba(255,255,255,0.08)'

  const stats = [
    { label: 'concluídas',     val: `${done.length} / ${weekly.length}`, pink: false },
    { label: 'tempo de foco',  val: formatMinutes(focusMin),              pink: false },
    { label: 'lazer ganho',    val: formatMinutes(earned),                pink: true  },
    { label: 'taxa',           val: `${rate}%`,                           pink: false },
    { label: 'banco de lazer', val: formatMinutes(balanceMin),            pink: true  },
    { label: 'streak',         val: '3 dias',                             pink: false },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* header */}
      <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: border, background: '#1a1a1a', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: 28, fontWeight: 500 }}>resumo semanal</h1>
        <p style={{ fontSize: 16, color: '#888', marginTop: 4 }}>
          {formatShortDate(start)} a {formatShortDate(end)}
        </p>
      </div>

      <div style={{ padding: '1.5rem 1.75rem', flex: 1 }}>
        <div style={{ background: '#222', borderRadius: 16, border, padding: '1.75rem' }}>

          <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>semana atual</div>
          <div style={{ fontSize: 15, color: '#888', marginBottom: 24 }}>
            {formatShortDate(start)} a {formatShortDate(end)}
          </div>

          {/* grid de stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: '#2a2a2a', borderRadius: 12, border, padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: 15, color: '#888', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 500, color: s.pink ? '#ED93B1' : '#f0f0f0' }}>
                  {s.val}
                </div>
              </div>
            ))}
          </div>

          {/* mensagem motivacional */}
          <div style={{ background: '#4B1528', border: '.5px solid #72243E', borderRadius: 12, padding: '1rem 1.25rem', fontSize: 16, color: '#F4C2D4', lineHeight: 1.6 }}>
            {getMessage()}
          </div>

        </div>
      </div>
    </div>
  )
}