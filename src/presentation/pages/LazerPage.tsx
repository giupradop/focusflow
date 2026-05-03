import { useEffect, useRef, useState } from 'react'
import { useLeisureStore } from '../store/useLeisureStore'
import { useAppStore } from '../store/useAppStore'
import { Modal } from '../components/ui/Modal'
import { formatLeisureBalance } from '../../utils/leisureCalc'
import { formatSeconds, formatMinutes } from '../../utils/formatTime'

export function LazerPage() {
  const { bank, activities, activeSession, loadBank, loadActivities, createActivity, deleteActivity, startSession, completeSession, tickSession } = useLeisureStore()
  const { showToast } = useAppStore()

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCost, setNewCost] = useState(30)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { loadBank(); loadActivities() }, [])

  useEffect(() => {
    if (activeSession) {
      intervalRef.current = setInterval(() => { tickSession() }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeSession?.id])

  async function handleStart(activityId: number) {
    try { await startSession(activityId) }
    catch (e: any) { showToast(e.message) }
  }

  async function handleComplete() {
    await completeSession()
    showToast('lazer encerrado!')
    loadBank()
  }

  async function handleCreateActivity() {
    if (!newName.trim()) return
    await createActivity(newName.trim(), newCost)
    setNewName(''); setNewCost(30); setShowForm(false)
    showToast('atividade criada!')
  }

  const balanceText = bank ? formatLeisureBalance(bank.balance.minutes) : '0m'
  const remaining = activeSession ? activeSession.remainingSeconds : 0
  const pct = activeSession ? Math.round((1 - activeSession.remainingSeconds / (activeSession.activityCostMinutes * 60)) * 100) : 0

  const inputStyle: React.CSSProperties = { width: '100%', background: '#333', border: '.5px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 12px', fontSize: 15, color: '#f0f0f0', outline: 'none', fontFamily: 'inherit' }
  const labelStyle: React.CSSProperties = { fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6, display: 'block' }

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

      <div style={{ padding: '1.5rem 1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* saldo */}
        <div style={{ background: '#4B1528', border: '.5px solid #72243E', borderRadius: 16, padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, color: '#ED93B1', marginBottom: 4 }}>saldo disponível</div>
            <div style={{ fontSize: 52, fontWeight: 500, color: '#D4537E', lineHeight: 1 }}>{balanceText}</div>
            <div style={{ fontSize: 13, color: '#993556', marginTop: 6 }}>acumulado · nunca expira</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, color: '#ED93B1' }}>banco de lazer</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>use com sabedoria 🌸</div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#5DCAA5', marginTop: 6 }}>
              <span>{pct}% aproveitado</span>
              <span>restam {formatSeconds(remaining)}</span>
            </div>
          </div>
        )}

        {/* atividades */}
        <div>
          <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>atividades cadastradas</div>
          {activities.length === 0 ? (
            <div style={{ fontSize: 15, color: '#888', padding: '1rem 0' }}>nenhuma atividade cadastrada</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activities.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#222', border: '.5px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>{a.name}</div>
                    <div style={{ fontSize: 14, color: '#888', marginTop: 2 }}>custo: {formatMinutes(a.costMinutes)}</div>
                  </div>
                  <button
                    onClick={() => handleStart(a.id)}
                    disabled={!!activeSession || !bank || bank.balance.minutes < a.costMinutes}
                    style={{ padding: '8px 18px', background: '#D4537E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer', opacity: (!!activeSession || !bank || bank.balance.minutes < a.costMinutes) ? 0.4 : 1 }}
                    onMouseEnter={e => { if (!(!!activeSession || !bank || bank.balance.minutes < a.costMinutes)) (e.currentTarget as HTMLElement).style.background = '#993556' }}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#D4537E'}
                  >
                    usar
                  </button>
                  <button
                    onClick={async () => { await deleteActivity(a.id); showToast('atividade removida') }}
                    style={{ width: 32, height: 32, borderRadius: 6, border: '.5px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#888', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#2e1010'; el.style.color = '#F09595' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = '#888' }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="nova atividade de lazer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>nome</label>
            <input style={inputStyle} value={newName} onChange={e => setNewName(e.target.value)} placeholder="ex: jogar zelda" />
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