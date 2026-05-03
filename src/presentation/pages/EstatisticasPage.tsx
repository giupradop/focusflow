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

  useEffect(() => { loadWeek(0) }, [])

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

  const priColor: Record<string, string> = { alta: '#E24B4A', média: '#E8A838', baixa: '#888' }

  const border = '.5px solid rgba(255,255,255,0.08)'
  const cardStyle: React.CSSProperties = {
    background: '#222', borderRadius: 12,
    border, padding: '1.25rem 1.5rem',
  }
  const sectionLabel: React.CSSProperties = {
    fontSize: 13, color: '#888', textTransform: 'uppercase',
    letterSpacing: '.06em', marginBottom: 16, fontWeight: 500,
  }
  const inputStyle: React.CSSProperties = {
    background: '#2a2a2a', border, borderRadius: 8,
    padding: '7px 12px', fontSize: 15, color: '#f0f0f0',
    outline: 'none',
  }

  function BarRow({ label, mins, max, color = '#D4537E', fmt = true }: {
    label: string, mins: number, max: number, color?: string, fmt?: boolean
  }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 15, color: '#888', width: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
          <div style={{ height: 4, background: color, borderRadius: 99, width: `${Math.round(mins / max * 100)}%`, transition: 'width .4s ease' }} />
        </div>
        <span style={{ fontSize: 15, color: '#888', width: 48, textAlign: 'right' }}>
          {fmt ? formatMinutes(mins) : mins}
        </span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* header */}
      <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: border, background: '#1a1a1a', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: 28, fontWeight: 500 }}>estatísticas</h1>
        <p style={{ fontSize: 16, color: '#888', marginTop: 4 }}>acompanhe seu progresso</p>
      </div>

      <div style={{ padding: '1.5rem 1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* filtro de período */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {(['week', 'month', 'custom'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '8px 18px', borderRadius: 8, fontSize: 15, cursor: 'pointer',
                background: period === p ? '#4B1528' : 'transparent',
                color: period === p ? '#ED93B1' : '#888',
                border: period === p ? '.5px solid #72243E' : border,
                fontWeight: period === p ? 500 : 400,
                transition: 'all .15s',
              }}
            >
              {p === 'week' ? 'esta semana' : p === 'month' ? 'este mês' : 'personalizado'}
            </button>
          ))}
          {period === 'custom' && (
            <>
              <input type="date" style={inputStyle} value={from} onChange={e => setFrom(e.target.value)} />
              <span style={{ fontSize: 15, color: '#888' }}>até</span>
              <input type="date" style={inputStyle} value={to} onChange={e => setTo(e.target.value)} />
            </>
          )}
        </div>

        {/* cards de resumo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'tarefas concluídas', val: done.length, color: '#f0f0f0' },
            { label: 'tempo de foco', val: formatMinutes(focusMin), color: '#f0f0f0' },
            { label: 'lazer ganho', val: formatMinutes(earned), color: '#ED93B1' },
            { label: 'taxa de conclusão', val: `${rate}%`, color: '#f0f0f0' },
          ].map(c => (
            <div key={c.label} style={cardStyle}>
              <div style={{ fontSize: 15, color: '#888', marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontSize: 28, fontWeight: 500, color: c.color }}>{c.val}</div>
            </div>
          ))}
        </div>

        {/* gráficos linha 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={cardStyle}>
            <div style={sectionLabel}>foco por categoria</div>
            {byCat.length === 0
              ? <div style={{ fontSize: 16, color: '#888' }}>sem dados</div>
              : byCat.map(x => <BarRow key={x.cat} label={x.cat} mins={x.mins} max={maxCat} color="#D4537E" />)
            }
          </div>

          <div style={cardStyle}>
            <div style={sectionLabel}>lazer por atividade</div>
            {activities.length === 0
              ? <div style={{ fontSize: 16, color: '#888' }}>sem dados</div>
              : activities.map(a => <BarRow key={a.id} label={a.name} mins={0} max={1} color="#5DCAA5" />)
            }
          </div>
        </div>

        {/* gráficos linha 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={cardStyle}>
            <div style={sectionLabel}>tarefas por dia</div>
            {byDay.map(x => <BarRow key={x.d} label={x.d} mins={x.cnt} max={maxDay} color="#D4537E" fmt={false} />)}
          </div>

          <div style={cardStyle}>
            <div style={sectionLabel}>concluídas por prioridade</div>
            {byPri.map(x => (
              <BarRow key={x.p} label={x.p} mins={x.cnt} max={maxPri} color={priColor[x.p]} fmt={false} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}