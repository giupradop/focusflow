import { useEffect, useState } from 'react'
import { useTaskStore } from '../store/useTaskStore'
import { useLeisureStore } from '../store/useLeisureStore'
import { formatMinutes } from '../../utils/formatTime'
import { getWeekRange } from '../../utils/weekHelpers'

const CATS = ['trabalho', 'faculdade', 'saúde e bem estar', 'formação pessoal', 'projetos pessoais']

type Period = 'week' | 'month' | 'custom'

export function EstatisticasPage() {
  const { tasks, loadWeek } = useTaskStore()
  const { activities } = useLeisureStore()
  const [period, setPeriod] = useState<Period>('week')
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 10))
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    loadWeek(0)
  }, [])

  function getRange(): { start: Date, end: Date } {
    if (period === 'week') return getWeekRange(0)
    if (period === 'month') {
      const now = new Date()
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      }
    }
    return {
      start: new Date(from + 'T00:00:00'),
      end: new Date(to + 'T23:59:59'),
    }
  }

  const { start, end } = getRange()
  const inRange = tasks.filter(t => t.createdAt >= start && t.createdAt <= end)
  const done = inRange.filter(t => t.status === 'concluída')
  const focusMin = done.reduce((a, t) => a + t.totalSpentSeconds / 60, 0)
  const earned = Math.ceil(focusMin / 5)
  const rate = inRange.length ? Math.round(done.length / inRange.length * 100) : 0

  const byCat = CATS.map(cat => {
    const mins = done.filter(t => t.category === cat).reduce((a, t) => a + t.totalSpentSeconds / 60, 0)
    return { cat, mins }
  }).filter(x => x.mins > 0).sort((a, b) => b.mins - a.mins)
  const maxCat = byCat[0]?.mins || 1

  const DAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
  const byDay = DAYS.map((d, i) => ({
    d,
    cnt: done.filter(t => t.createdAt.getDay() === i).length,
  }))
  const maxDay = Math.max(...byDay.map(x => x.cnt), 1)

  const byPri = ['alta', 'média', 'baixa'].map(p => ({
    p,
    cnt: done.filter(t => t.priority.toString() === p).length,
  }))
  const maxPri = Math.max(...byPri.map(x => x.cnt), 1)

  const priColor: Record<string, string> = {
    alta: 'bg-[var(--red)]',
    média: 'bg-[var(--amber)]',
    baixa: 'bg-[var(--muted)]',
  }

  const inputCls = 'bg-[var(--bg3)] border border-[var(--border2)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] outline-none'

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-7 pt-6 pb-4 border-b border-[var(--border)] bg-[var(--bg)] sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-medium">estatísticas</h1>
          <p className="text-sm text-[var(--muted)] mt-1">acompanhe seu progresso</p>
        </div>
      </div>

      <div className="px-7 py-6 flex-1 flex flex-col gap-5">

        {/* filtro de período */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['week', 'month', 'custom'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs border cursor-pointer transition-colors
                ${period === p
                  ? 'bg-[var(--pink-900)] text-[var(--pink-200)] border-[var(--pink-800)]'
                  : 'bg-[var(--bg3)] text-[var(--muted)] border-[var(--border2)] hover:text-[var(--text)]'
                }`}
            >
              {p === 'week' ? 'esta semana' : p === 'month' ? 'este mês' : 'personalizado'}
            </button>
          ))}
          {period === 'custom' && (
            <>
              <input type="date" className={inputCls} value={from} onChange={e => setFrom(e.target.value)} />
              <span className="text-xs text-[var(--muted)]">até</span>
              <input type="date" className={inputCls} value={to} onChange={e => setTo(e.target.value)} />
            </>
          )}
        </div>

        {/* cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'tarefas concluídas', val: done.length, color: '' },
            { label: 'tempo de foco', val: formatMinutes(focusMin), color: '' },
            { label: 'lazer ganho', val: formatMinutes(earned), color: 'text-[var(--pink-400)]' },
            { label: 'taxa de conclusão', val: `${rate}%`, color: '' },
          ].map(c => (
            <div key={c.label} className="bg-[var(--bg2)] rounded-xl p-4">
              <div className="text-xs text-[var(--muted)] mb-1">{c.label}</div>
              <div className={`text-2xl font-medium ${c.color}`}>{c.val}</div>
            </div>
          ))}
        </div>

        {/* gráficos */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--bg2)] rounded-xl p-5">
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-4">foco por categoria</div>
            {byCat.length === 0 ? (
              <div className="text-sm text-[var(--muted)]">sem dados</div>
            ) : byCat.map(x => (
              <div key={x.cat} className="flex items-center gap-2 mb-2">
                <span className="text-xs text-[var(--muted)] w-32 truncate">{x.cat}</span>
                <div className="flex-1 h-1.5 bg-[var(--bg4)] rounded-full">
                  <div className="h-1.5 bg-[var(--pink-400)] rounded-full" style={{ width: `${Math.round(x.mins / maxCat * 100)}%` }} />
                </div>
                <span className="text-xs w-10 text-right">{formatMinutes(x.mins)}</span>
              </div>
            ))}
          </div>

          <div className="bg-[var(--bg2)] rounded-xl p-5">
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-4">lazer por atividade</div>
            {activities.length === 0 ? (
              <div className="text-sm text-[var(--muted)]">sem dados</div>
            ) : activities.map(a => (
              <div key={a.id} className="flex items-center gap-2 mb-2">
                <span className="text-xs text-[var(--muted)] w-32 truncate">{a.name}</span>
                <div className="flex-1 h-1.5 bg-[var(--bg4)] rounded-full">
                  <div className="h-1.5 bg-[var(--green)] rounded-full" style={{ width: '0%' }} />
                </div>
                <span className="text-xs w-10 text-right text-[var(--green)]">0m</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--bg2)] rounded-xl p-5">
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-4">tarefas por dia</div>
            {byDay.map(x => (
              <div key={x.d} className="flex items-center gap-2 mb-2">
                <span className="text-xs text-[var(--muted)] w-8">{x.d}</span>
                <div className="flex-1 h-1.5 bg-[var(--bg4)] rounded-full">
                  <div className="h-1.5 bg-[var(--pink-400)] rounded-full" style={{ width: `${Math.round(x.cnt / maxDay * 100)}%` }} />
                </div>
                <span className="text-xs w-6 text-right">{x.cnt}</span>
              </div>
            ))}
          </div>

          <div className="bg-[var(--bg2)] rounded-xl p-5">
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-4">concluídas por prioridade</div>
            {byPri.map(x => (
              <div key={x.p} className="flex items-center gap-2 mb-2">
                <span className="text-xs text-[var(--muted)] w-12">{x.p}</span>
                <div className="flex-1 h-1.5 bg-[var(--bg4)] rounded-full">
                  <div className={`h-1.5 rounded-full ${priColor[x.p]}`} style={{ width: `${Math.round(x.cnt / maxPri * 100)}%` }} />
                </div>
                <span className="text-xs w-6 text-right">{x.cnt}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}