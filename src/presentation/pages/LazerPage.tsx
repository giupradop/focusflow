import { useEffect, useRef, useState } from 'react'
import { useLeisureStore } from '../store/useLeisureStore'
import { useAppStore } from '../store/useAppStore'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { formatLeisureBalance } from '../../utils/leisureCalc'
import { formatSeconds, formatMinutes } from '../../utils/formatTime'

export function LazerPage() {
  const {
    bank, activities, activeSession,
    loadBank, loadActivities, createActivity,
    deleteActivity, startSession, completeSession, tickSession
  } = useLeisureStore()
  const { showToast } = useAppStore()

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCost, setNewCost] = useState(30)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    loadBank()
    loadActivities()
  }, [])

  useEffect(() => {
    if (activeSession) {
      intervalRef.current = setInterval(() => {
        tickSession()
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [activeSession?.id])

  async function handleStart(activityId: number) {
    try {
      await startSession(activityId)
    } catch (e: any) {
      showToast(e.message)
    }
  }

  async function handleComplete() {
    await completeSession()
    showToast('lazer encerrado!')
    loadBank()
  }

  async function handleCreateActivity() {
    if (!newName.trim()) return
    await createActivity(newName.trim(), newCost)
    setNewName('')
    setNewCost(30)
    setShowForm(false)
    showToast('atividade criada!')
  }

  const balanceText = bank ? formatLeisureBalance(bank.balance.minutes) : '0m'
  const remaining = activeSession ? activeSession.remainingSeconds : 0
  const pct = activeSession ? Math.round((1 - activeSession.remainingSeconds / (activeSession.activityCostMinutes * 60)) * 100) : 0

  const inputCls = 'w-full bg-[var(--bg4)] border border-[var(--border2)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--pink-500)]'
  const labelCls = 'text-[11px] text-[var(--muted)] uppercase tracking-wider mb-1 block'

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-7 pt-6 pb-4 border-b border-[var(--border)] bg-[var(--bg)] sticky top-0 z-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-medium">lazer</h1>
            <p className="text-sm text-[var(--muted)] mt-1">gaste seu tempo conquistado</p>
          </div>
          <Button label="+ nova atividade" onClick={() => setShowForm(true)} />
        </div>
      </div>

      <div className="px-7 py-6 flex-1 flex flex-col gap-5">

        {/* saldo */}
        <div className="bg-[var(--pink-900)] border border-[var(--pink-800)] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--pink-200)] mb-1">saldo disponível</div>
            <div className="text-5xl font-medium text-[var(--pink-400)]">{balanceText}</div>
            <div className="text-xs text-[var(--pink-500)] mt-1.5">acumulado · nunca expira</div>
          </div>
          <div className="text-right text-sm">
            <div className="text-[var(--pink-200)]">banco de lazer</div>
            <div className="text-xs text-[var(--muted)] mt-1">use com sabedoria 🌸</div>
          </div>
        </div>

        {/* timer ativo */}
        {activeSession && (
          <div className="bg-[var(--green-bg)] border border-[#0F6E56] rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-base font-medium text-[#9FE1CB]">lazer em andamento</div>
                <div className="text-xs text-[var(--green)] mt-1">{formatMinutes(activeSession.activityCostMinutes)} reservados</div>
              </div>
              <span className="text-xs bg-[var(--green-bg)] text-[var(--green)] border border-[#0F6E56] px-2 py-1 rounded-full">usando</span>
            </div>
            <div className="flex items-center gap-4 my-3">
              <div className="text-[40px] font-medium font-mono text-[var(--green)]">
                {formatSeconds(remaining)}
            </div>
              <Button label="encerrar" onClick={handleComplete} />
            </div>
            <div className="h-1 bg-[#0a3028] rounded-full">
              <div className="h-1 bg-[var(--green)] rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-[#5DCAA5] mt-1.5">
              <span>{pct}% aproveitado</span>
              <span>restam {formatSeconds(remaining)}</span>
            </div>
          </div>
        )}

        {/* atividades */}
        <div>
          <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-3">atividades cadastradas</div>
          {activities.length === 0 ? (
            <div className="text-sm text-[var(--muted)] py-4">nenhuma atividade cadastrada</div>
          ) : (
            <div className="flex flex-col gap-2">
              {activities.map(a => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3 bg-[var(--bg2)] border border-[var(--border)] rounded-xl">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{a.name}</div>
                    <div className="text-xs text-[var(--muted)] mt-0.5">custo: {formatMinutes(a.costMinutes)}</div>
                  </div>
                  <button
                    onClick={() => handleStart(a.id)}
                    disabled={!!activeSession || !bank || bank.balance.minutes < a.costMinutes}
                    className="px-4 py-1.5 bg-[var(--pink-400)] text-white text-xs font-medium rounded-lg border-none cursor-pointer hover:bg-[var(--pink-500)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    usar
                  </button>
                  <button
                    onClick={async () => {
                      await deleteActivity(a.id)
                      showToast('atividade removida')
                    }}
                    className="w-7 h-7 rounded-md border border-[var(--border)] bg-transparent text-[var(--muted)] hover:bg-[var(--red-bg)] hover:text-[#F09595] flex items-center justify-center cursor-pointer text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="nova atividade de lazer">
        <div className="flex flex-col gap-3">
          <div>
            <label className={labelCls}>nome</label>
            <input className={inputCls} value={newName} onChange={e => setNewName(e.target.value)} placeholder="ex: jogar zelda" />
          </div>
          <div>
            <label className={labelCls}>custo (minutos do banco)</label>
            <input className={inputCls} type="number" min={5} step={5} value={newCost} onChange={e => setNewCost(+e.target.value)} />
          </div>
          <div className="flex gap-2 mt-2">
            <Button label="criar" onClick={handleCreateActivity} />
            <Button label="cancelar" onClick={() => setShowForm(false)} variant="secondary" />
          </div>
        </div>
      </Modal>
    </div>
  )
}