import { useEffect, useRef, useState } from 'react'
import { useTaskStore } from '../../store/useTaskStore'
import { useAppStore } from '../../store/useAppStore'
import { formatSeconds, formatMinutes } from '../../../utils/formatTime'
import { Button } from '../ui/Button'
import type { Task } from '../../../domain/task/Task'
import { Session } from '../../../domain/task/Session'

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
    if (!sessionRef.current) return
    await completeSession({ taskId: task.id, session: sessionRef.current, ratio: 5 })
    showToast('sessão concluída! 🎉')
    onClose()
  }

  async function handleLater() {
    stopTimer()
    if (!sessionRef.current) return
    await pauseSession({ taskId: task.id, session: sessionRef.current })
    showToast('tempo parcial salvo — continue quando quiser')
    onClose()
  }

  const isOver = seconds < 0
  const timerColor = isOver ? 'text-[var(--red)]' : 'text-[var(--pink-200)]'
  const fillColor = isOver ? 'bg-[var(--red)]' : 'bg-[var(--pink-400)]'
  const pct = Math.min(100, Math.round(((task.estimatedMinutes * 60 - seconds) / (task.estimatedMinutes * 60)) * 100))

  return (
    <div className="bg-[var(--pink-900)] border border-[var(--pink-800)] rounded-xl p-5 mb-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-base font-medium text-[var(--pink-100)]">{task.name}</div>
          <div className="text-xs text-[var(--pink-400)] mt-1">
            {task.category} · estimado {formatMinutes(task.estimatedMinutes)} · vence {task.dueDate.toLocaleDateString('pt-BR')}
            {task.totalSpentSeconds > 0 && ` · anterior: ${formatMinutes(task.totalSpentSeconds / 60)}`}
          </div>
        </div>
        <span className="text-xs bg-[var(--pink-800)] text-[var(--pink-200)] px-2 py-1 rounded-full">em andamento</span>
      </div>

      <div className="flex items-center gap-4 my-3">
        <div className={`text-[40px] font-medium font-mono ${timerColor}`}>
          {formatSeconds(seconds)}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button label={isRunning ? 'pausar' : 'retomar'} onClick={handlePause} variant="secondary" />
          <Button label="concluir sessão" onClick={handleComplete} />
          <Button label="continuar depois" onClick={handleLater} variant="secondary" />
        </div>
      </div>

      <div className="h-1 bg-[var(--pink-800)] rounded-full mt-2">
        <div className={`h-1 rounded-full transition-all ${fillColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-[var(--pink-500)] mt-1.5">
        <span>pausa: {formatMinutes(pausedSeconds / 60)}</span>
        <span>{isOver ? `excedeu ${formatMinutes(-seconds / 60)}` : `${pct}% concluído`} · total: {formatMinutes((task.totalSpentSeconds + (task.estimatedMinutes * 60 - seconds)) / 60)}</span>
      </div>

      <div className="mt-4 border-t border-[var(--pink-800)] pt-3">
        <div className="text-[10px] text-[var(--pink-400)] uppercase tracking-wider mb-1.5">observações</div>
        <textarea
          className="w-full bg-white/5 border border-[var(--pink-800)] rounded-lg px-3 py-2 text-xs text-[var(--pink-100)] outline-none focus:border-[var(--pink-400)] resize-y min-h-[56px] leading-relaxed font-inherit placeholder:text-[var(--pink-800)]"
          placeholder="anote dúvidas, progresso, próximos passos..."
          defaultValue={task.notes}
        />
      </div>
    </div>
  )
}