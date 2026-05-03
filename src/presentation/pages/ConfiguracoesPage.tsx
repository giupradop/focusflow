import { useLeisureStore } from '../store/useLeisureStore'
import { useTaskStore } from '../store/useTaskStore'
import { useAppStore } from '../store/useAppStore'
import { useEffect } from 'react'

const DAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export function ConfiguracoesPage() {
  const { ratio, setRatio } = useLeisureStore()
  const { tasks, loadWeek, pauseRecurrence } = useTaskStore()
  const { showToast } = useAppStore()

  useEffect(() => { loadWeek(0) }, [])

  const recurrentTasks = tasks.filter(t => t.recurrent && !t.recurPaused && !t.archived)

  const border = '.5px solid rgba(255,255,255,0.08)'
  const cardStyle: React.CSSProperties = { background: '#222', borderRadius: 12, border, padding: '1.25rem 1.5rem', marginBottom: 16 }
  const cardTitle: React.CSSProperties = { fontSize: 17, fontWeight: 500, marginBottom: 16 }
  const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: border }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* header */}
      <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: border, background: '#1a1a1a', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: 28, fontWeight: 500 }}>configurações</h1>
      </div>

      <div style={{ padding: '1.5rem 1.75rem', flex: 1 }}>

        {/* banco de lazer */}
        <div style={cardStyle}>
          <div style={cardTitle}>banco de lazer</div>

          <div style={rowStyle}>
            <div>
              <div style={{ fontSize: 17 }}>proporção de lazer</div>
              <div style={{ fontSize: 15, color: '#888', marginTop: 4 }}>
                a cada <strong style={{ color: '#f0f0f0' }}>{ratio}</strong> min de foco → 1 min de lazer
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setRatio(Math.max(1, ratio - 1))}
                style={{ width: 34, height: 34, borderRadius: 8, border, background: 'transparent', color: '#888', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#2a2a2a'; el.style.color = '#f0f0f0' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = '#888' }}
              >−</button>
              <span style={{ fontSize: 22, fontWeight: 500, minWidth: 24, textAlign: 'center' }}>{ratio}</span>
              <button
                onClick={() => setRatio(Math.min(20, ratio + 1))}
                style={{ width: 34, height: 34, borderRadius: 8, border, background: 'transparent', color: '#888', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#2a2a2a'; el.style.color = '#f0f0f0' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = '#888' }}
              >+</button>
            </div>
          </div>

          <div style={{ ...rowStyle, borderBottom: 'none', paddingBottom: 0 }}>
            <div>
              <div style={{ fontSize: 17 }}>base do cálculo</div>
              <div style={{ fontSize: 15, color: '#888', marginTop: 4 }}>sempre baseado no tempo real trabalhado</div>
            </div>
            <span style={{ fontSize: 15, color: '#5DCAA5' }}>tempo real</span>
          </div>
        </div>

        {/* recorrências ativas */}
        <div style={{ ...cardStyle, marginBottom: 0 }}>
          <div style={cardTitle}>recorrências ativas</div>
          {recurrentTasks.length === 0 ? (
            <div style={{ fontSize: 16, color: '#888' }}>nenhuma recorrência ativa</div>
          ) : recurrentTasks.map((task, i) => (
            <div
              key={task.id}
              style={{ ...rowStyle, borderBottom: i < recurrentTasks.length - 1 ? border : 'none', paddingBottom: i < recurrentTasks.length - 1 ? 14 : 0 }}
            >
              <div>
                <div style={{ fontSize: 17, fontWeight: 500 }}>{task.name}</div>
                <div style={{ fontSize: 14, color: '#888', marginTop: 3 }}>
                  {task.recurDays.map((d: number) => DAYS[d]).join(', ')}
                </div>
              </div>
              <button
                onClick={async () => {
                  await pauseRecurrence(task.id)
                  showToast('recorrência pausada — veja o arquivo para retomar')
                }}
                style={{ fontSize: 15, padding: '7px 16px', borderRadius: 8, border: '.5px solid rgba(232,168,56,0.4)', background: 'transparent', color: '#E8A838', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(232,168,56,0.08)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                pausar
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}