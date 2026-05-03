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

  const stats = [
    { label: 'concluídas', val: `${done.length} / ${weekly.length}` },
    { label: 'tempo de foco', val: formatMinutes(focusMin) },
    { label: 'lazer ganho', val: formatMinutes(earned), pink: true },
    { label: 'taxa', val: `${rate}%` },
    { label: 'banco de lazer', val: formatMinutes(balanceMin), pink: true },
    { label: 'streak', val: '3 dias' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-7 pt-6 pb-4 border-b border-[var(--border)] bg-[var(--bg)] sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-medium">resumo semanal</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {formatShortDate(start)} a {formatShortDate(end)}
          </p>
        </div>
      </div>

      <div className="px-7 py-6 flex-1">
        <div className="bg-[var(--bg2)] rounded-2xl p-6">
          <div className="text-lg font-medium mb-1">semana atual</div>
          <div className="text-sm text-[var(--muted)] mb-6">
            {formatShortDate(start)} a {formatShortDate(end)}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {stats.map(s => (
              <div key={s.label} className="bg-[var(--bg3)] rounded-xl p-4">
                <div className="text-xs text-[var(--muted)] mb-1">{s.label}</div>
                <div className={`text-xl font-medium ${s.pink ? 'text-[var(--pink-400)]' : ''}`}>
                  {s.val}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[var(--pink-900)] border border-[var(--pink-800)] rounded-xl p-4 text-sm text-[var(--pink-100)] leading-relaxed">
            {getMessage()}
          </div>
        </div>
      </div>
    </div>
  )
}