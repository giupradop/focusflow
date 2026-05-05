import { useEffect, useRef, useState } from 'react'
import { useLeisureStore } from '../store/useLeisureStore'
import { useAppStore } from '../store/useAppStore'
import { Modal } from '../components/ui/Modal'
import { formatLeisureBalance } from '../../utils/leisureCalc'
import { formatSeconds, formatMinutes } from '../../utils/formatTime'
import type { LeisureActivity } from '../../domain/leisure/LeisureActivity'

function formatWeekRange(weekStart: string, weekEnd: string): string {
  const fmt = (s: string) => {
    const [, m, d] = s.split('-')
    return `${d}/${m}`
  }
  return `${fmt(weekStart)} – ${fmt(weekEnd)}`
}

export function LazerPage() {
  const { bank, activities, activeSession, history, loadBank, loadActivities, loadHistory, createActivity, deleteActivity, startSession, completeSession } = useLeisureStore()
  const { showToast } = useAppStore()

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCost, setNewCost] = useState(30)
  const [selectedActivity, setSelectedActivity] = useState<LeisureActivity | null>(null)
  const [customMinutes, setCustomMinutes] = useState(30)
  const [, forceUpdate] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { loadBank(); loadActivities(); loadHistory() }, [])

  useEffect(() => {
    if (activeSession) {
      intervalRef.current = setInterval(() => {
        forceUpdate(n => n + 1)
        // auto-complete when time is up
        const elapsed = Math.floor((Date.now() - activeSession.startedAt.getTime()) / 1000)
        if (elapsed >= activeSession.activityCostMinutes * 60) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          useLeisureStore.getState().completeSession(elapsed)
        }
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeSession?.id])

  function handleClickUsar(activity: LeisureActivity) {
    setSelectedActivity(activity)
    setCustomMinutes(activity.costMinutes)
  }

  async function handleConfirmStart() {
    if (!selectedActivity) return
    try {
      await startSession(selectedActivity.id, customMinutes)
      setSelectedActivity(null)
    } catch (e: any) {
      showToast(e.message)
    }
  }

  async function handleComplete() {
    const elapsed = activeSession ? Math.floor((Date.now() - activeSession.startedAt.getTime()) / 1000) : undefined
    await completeSession(elapsed)
    showToast('lazer encerrado!')
  }

  async function handleCreateActivity() {
    if (!newName.trim()) return
    await createActivity(newName.trim(), newCost)
    setNewName(''); setNewCost(30); setShowForm(false)
    showToast('atividade criada!')
  }

  const balanceText = bank ? formatLeisureBalance(bank.balance.minutes) : '0m'
  const leisureElapsed = activeSession ? Math.floor((Date.now() - activeSession.startedAt.getTime()) / 1000) : 0
  const remaining = activeSession ? Math.max(0, activeSession.activityCostMinutes * 60 - leisureElapsed) : 0
  const pct = activeSession ? Math.min(100, Math.round((leisureElapsed / (activeSession.activityCostMinutes * 60)) * 100)) : 0

  const inputStyle: React.CSSProperties = { width: '100%', background: '#333', border: '.5px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 12px', fontSize: 15, color: '#f0f0f0', outline: 'none', fontFamily: 'inherit' }
  const labelStyle: React.CSSProperties = { fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6, display: 'block' }
  const sectionLabel: React.CSSProperties = { fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* header */}
      <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: '.5px solid rgba(255,255,255,0.08)', background: '#1a1a1a', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 500 }}>lazer</h1>
            <p style={{ fontSize: 15, color: '#888', marginTop: 4 }}>gaste seu tempo conquistado</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: '10px 20px', background: '#D4537E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
          >
            + nova atividade
          </button>
        </div>
      </div>

      <div style={{ padding: '1.5rem 1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* saldo */}
        <div style={{ background: '#4B1528', border: '.5px solid #72243E', borderRadius: 16, padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, color: '#ED93B1', marginBottom: 4 }}>saldo disponível</div>
            <div style={{ fontSize: 52, fontWeight: 500, color: '#D4537E', lineHeight: 1 }}>{balanceText}</div>
            <div style={{ fontSize: 13, color: '#993556', marginTop: 6 }}>acumulado · nunca expira</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 15 }}>
            <div style={{ color: '#ED93B1' }}>
              + ganho total: <strong>{formatLeisureBalance(bank?.totalDepositedMinutes ?? 0)}</strong>
            </div>
            <div style={{ color: '#888', marginTop: 6 }}>
              − gasto total: <strong style={{ color: '#f0f0f0' }}>
                {formatLeisureBalance((bank?.totalDepositedMinutes ?? 0) - (bank?.balance.minutes ?? 0))}
              </strong>
            </div>
          </div>
        </div>

        {/* timer ativo */}
        {activeSession && (
          <div style={{ background: '#0a2820', border: '.5px solid #0F6E56', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 500, color: '#9FE1CB' }}>lazer em andamento</div>
                <div style={{ fontSize: 13, color: '#5DCAA5', marginTop: 4 }}>{formatMinutes(activeSession.activityCostMinutes)} reservados</div>
              </div>
              <span style={{ fontSize: 13, background: '#0a2820', color: '#5DCAA5', border: '.5px solid #0F6E56', padding: '3px 10px', borderRadius: 20 }}>usando</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '12px 0' }}>
              <div style={{ fontSize: 44, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: '#5DCAA5' }}>
                {formatSeconds(remaining)}
              </div>
              <button
                onClick={handleComplete}
                style={{ padding: '8px 18px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#0F6E56'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1D9E75'}
              >
                encerrar
              </button>
            </div>
            <div style={{ height: 4, background: '#0a3028', borderRadius: 2 }}>
              <div style={{ height: 4, background: '#5DCAA5', borderRadius: 2, width: `${pct}%`, transition: 'width .5s' }} />
            </div>
          </div>
        )}

        {/* atividades + histórico lado a lado */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

          {/* atividades cadastradas */}
          <div>
            <div style={sectionLabel}>atividades cadastradas</div>
            {activities.length === 0 ? (
              <div style={{ fontSize: 15, color: '#888' }}>nenhuma atividade cadastrada</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...activities].sort((a, b) => a.name.localeCompare(b.name, 'pt')).map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#222', border: '.5px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 500 }}>{a.name}</div>
                      <div style={{ fontSize: 14, color: '#888', marginTop: 2 }}>sugerido: {formatMinutes(a.costMinutes)}</div>
                    </div>
                    <button
                      onClick={() => handleClickUsar(a)}
                      disabled={!!activeSession || !bank || bank.balance.minutes < 1}
                      style={{ padding: '8px 18px', background: '#D4537E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer', opacity: (!!activeSession || !bank || bank.balance.minutes < 1) ? 0.4 : 1 }}
                      onMouseEnter={e => { if (!(!!activeSession || !bank || bank.balance.minutes < 1)) (e.currentTarget as HTMLElement).style.background = '#993556' }}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#D4537E'}
                    >
                      usar
                    </button>
                    <button
                      onClick={async () => { await deleteActivity(a.id); showToast('atividade removida') }}
                      style={{ width: 32, height: 32, borderRadius: 6, border: '.5px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#555', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#2e1010'; el.style.color = '#F09595' }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = '#555' }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* coluna direita: histórico semanal + tempo por atividade */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* histórico semanal */}
            <div>
              <div style={sectionLabel}>histórico semanal</div>
              {history.weeklyHistory.length === 0 ? (
                <div style={{ fontSize: 14, color: '#555' }}>nenhum registro ainda</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {history.weeklyHistory.map(w => (
                    <div key={w.weekStart} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#222', border: '.5px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                      <span style={{ fontSize: 14, color: '#888' }}>{formatWeekRange(w.weekStart, w.weekEnd)}</span>
                      <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
                        <span style={{ color: '#ED93B1', fontWeight: 500 }}>+{formatLeisureBalance(w.earnedMinutes)}</span>
                        <span style={{ color: '#666' }}>−{formatLeisureBalance(w.spentMinutes)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* tempo gasto por atividade */}
            <div>
              <div style={sectionLabel}>tempo gasto por atividade</div>
              {history.perActivity.length === 0 ? (
                <div style={{ fontSize: 14, color: '#555' }}>nenhum registro ainda</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {history.perActivity.map(a => (
                    <div key={a.activityId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#222', border: '.5px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: a.totalUsedMinutes > 0 ? '#5DCAA5' : '#444', display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: '#ccc' }}>{a.name}</span>
                      </div>
                      <span style={{ fontSize: 14, color: a.totalUsedMinutes > 0 ? '#5DCAA5' : '#555', fontWeight: 500 }}>
                        {formatMinutes(a.totalUsedMinutes)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <Modal isOpen={!!selectedActivity} onClose={() => setSelectedActivity(null)} title={`usar · ${selectedActivity?.name ?? ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>quantos minutos?</label>
            <input
              style={inputStyle}
              type="number"
              min={1}
              step={5}
              value={customMinutes}
              onChange={e => setCustomMinutes(Math.max(1, +e.target.value))}
              onKeyDown={e => e.key === 'Enter' && handleConfirmStart()}
              autoFocus
            />
            <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>
              saldo disponível: {formatLeisureBalance(bank?.balance.minutes ?? 0)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleConfirmStart}
              disabled={!bank || bank.balance.minutes < customMinutes}
              style={{ padding: '10px 20px', background: '#D4537E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer', opacity: (!bank || bank.balance.minutes < customMinutes) ? 0.4 : 1 }}
            >
              iniciar
            </button>
            <button onClick={() => setSelectedActivity(null)} style={{ padding: '10px 16px', background: '#333', color: '#888', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer' }}>cancelar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="nova atividade de lazer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>nome</label>
            <input style={inputStyle} value={newName} onChange={e => setNewName(e.target.value)} placeholder="ex: jogar zelda" onKeyDown={e => e.key === 'Enter' && handleCreateActivity()} />
          </div>
          <div>
            <label style={labelStyle}>custo (minutos do banco)</label>
            <input style={inputStyle} type="number" min={5} step={5} value={newCost} onChange={e => setNewCost(+e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={handleCreateActivity} style={{ padding: '10px 20px', background: '#D4537E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>criar</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 16px', background: '#333', color: '#888', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer' }}>cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
