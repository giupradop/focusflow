import { useEffect, useRef, useState } from 'react'
import { useTaskStore } from '../../store/useTaskStore'
import { useAppStore } from '../../store/useAppStore'
import { formatSeconds, formatMinutes } from '../../../utils/formatTime'
import type { Task } from '../../../domain/task/Task'
import { Session } from '../../../domain/task/Session'
import { useLeisureStore } from '../../store/useLeisureStore'

type FocusTimerCardProps = {
  task: Task
  onClose: () => void
}

export function FocusTimerCard({ task, onClose }: FocusTimerCardProps) {
  const { completeSession, pauseSession } = useTaskStore()
  const { showToast } = useAppStore()
  const sessionRef = useRef<Session | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [seconds, setSeconds] = useState(task.remainingSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [pausedSeconds, setPausedSeconds] = useState(0)

  useEffect(() => {
    const sessionId = Date.now()
    sessionRef.current = Session.create(sessionId, task.id)
    startTimer()
    return () => stopTimer()
  }, [])

  function startTimer() {
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev - 1)
      sessionRef.current?.tick()
    }, 1000)
  }

  function stopTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsRunning(false)
  }

  function handlePause() {
    if (isRunning) {
      stopTimer()
      intervalRef.current = setInterval(() => {
        setPausedSeconds(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      startTimer()
    }
  }

  async function handleComplete() {
    stopTimer()
    const session = sessionRef.current
    if (!session) return
    sessionRef.current = null
    const { ratio } = useLeisureStore.getState()
    await completeSession({ taskId: task.id, session, ratio })
    showToast('sessão concluída! 🎉')
    onClose()
  }

  async function handleLater() {
    stopTimer()
    const session = sessionRef.current
    if (!session) return
    sessionRef.current = null
    await pauseSession({ taskId: task.id, session })
    showToast('tempo parcial salvo — continue quando quiser')
    onClose()
  }

  const isOver = seconds < 0
  const timerColor = isOver ? '#E24B4A' : '#ED93B1'
  const fillColor = isOver ? '#E24B4A' : '#D4537E'
  const pct = Math.min(100, Math.round(((task.estimatedMinutes * 60 - seconds) / (task.estimatedMinutes * 60)) * 100))

  const btnBase: React.CSSProperties = {
    padding: '8px 18px', borderRadius: 8, fontSize: 15,
    fontWeight: 500, cursor: 'pointer', border: 'none',
  }

  return (
    <div style={{ background: '#4B1528', border: '.5px solid #72243E', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem' }}>

      {/* top */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 500, color: '#F4C0D1' }}>{task.name}</div>
          <div style={{ fontSize: 13, color: '#D4537E', marginTop: 4 }}>
            {task.category} · estimado {formatMinutes(task.estimatedMinutes)} · vence {task.dueDate.toLocaleDateString('pt-BR')}
            {task.totalSpentSeconds > 0 && ` · anterior: ${formatMinutes(task.totalSpentSeconds / 60)}`}
          </div>
        </div>
        <span style={{ fontSize: 13, background: '#72243E', color: '#ED93B1', padding: '3px 10px', borderRadius: 20 }}>
          em andamento
        </span>
      </div>

      {/* timer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '12px 0' }}>
        <div style={{ fontSize: 44, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: timerColor, letterSpacing: '.02em', minWidth: 140 }}>
          {formatSeconds(seconds)}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={handlePause}
            style={{ ...btnBase, background: '#993556', color: '#fff' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#72243E'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#993556'}
          >
            {isRunning ? 'pausar' : 'retomar'}
          </button>
          <button
            onClick={handleComplete}
            style={{ ...btnBase, background: '#D4537E', color: '#fff' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#993556'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#D4537E'}
          >
            concluir sessão
          </button>
          <button
            onClick={handleLater}
            style={{ ...btnBase, background: '#333', color: '#888' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f0f0f0'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#888'}
          >
            continuar depois
          </button>
        </div>
      </div>

      {/* progress */}
      <div style={{ height: 4, background: '#72243E', borderRadius: 2, marginTop: 8 }}>
        <div style={{ height: 4, background: fillColor, borderRadius: 2, width: `${pct}%`, transition: 'width .5s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#993556', marginTop: 6 }}>
        <span>pausa: {formatMinutes(pausedSeconds / 60)}</span>
        <span>{isOver ? `excedeu ${formatMinutes(-seconds / 60)}` : `${pct}% concluído`} · total: {formatMinutes((task.totalSpentSeconds + (task.estimatedMinutes * 60 - seconds)) / 60)}</span>
      </div>

      {/* observações */}
      <div style={{ marginTop: 16, borderTop: '.5px solid #72243E', paddingTop: 12 }}>
        <div style={{ fontSize: 11, color: '#D4537E', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>observações</div>
        <textarea
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '.5px solid #72243E', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#F4C0D1', outline: 'none', resize: 'vertical', minHeight: 60, lineHeight: 1.5, fontFamily: 'inherit' }}
          placeholder="anote dúvidas, progresso, próximos passos..."
          defaultValue={task.notes}
          onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = '#D4537E'}
          onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = '#72243E'}
        />
      </div>
    </div>
  )
}