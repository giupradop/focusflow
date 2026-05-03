import { useLeisureStore } from '../store/useLeisureStore'
import { useTaskStore } from '../store/useTaskStore'
import { useAppStore } from '../store/useAppStore'
import { useEffect } from 'react'

const DAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export function ConfiguracoesPage() {
  const { ratio, setRatio } = useLeisureStore()
  const { tasks, loadWeek, pauseRecurrence } = useTaskStore()
  const { showToast } = useAppStore()

  useEffect(() => {
    loadWeek(0)
  }, [])

  const recurrentTasks = tasks.filter(t => t.recurrent && !t.recurPaused && !t.archived)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-7 pt-6 pb-4 border-b border-[var(--border)] bg-[var(--bg)] sticky top-0 z-10">
        <h1 className="text-2xl font-medium">configurações</h1>
      </div>

      <div className="px-7 py-6 flex-1 flex flex-col gap-4">

        {/* banco de lazer */}
        <div className="bg-[var(--bg2)] rounded-xl p-5">
          <div className="text-sm font-medium mb-4">banco de lazer</div>
          <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
            <div>
              <div className="text-sm">proporção de lazer</div>
              <div className="text-xs text-[var(--muted)] mt-1">
                a cada <strong>{ratio}</strong> min de foco → 1 min de lazer
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRatio(Math.max(1, ratio - 1))}
                className="w-8 h-8 rounded-lg border border-[var(--border2)] bg-transparent text-[var(--muted)] hover:bg-[var(--bg3)] hover:text-[var(--text)] cursor-pointer text-sm"
              >
                −
              </button>
              <span className="text-base font-medium min-w-[20px] text-center">{ratio}</span>
              <button
                onClick={() => setRatio(Math.min(20, ratio + 1))}
                className="w-8 h-8 rounded-lg border border-[var(--border2)] bg-transparent text-[var(--muted)] hover:bg-[var(--bg3)] hover:text-[var(--text)] cursor-pointer text-sm"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm">base do cálculo</div>
              <div className="text-xs text-[var(--muted)] mt-1">sempre baseado no tempo real trabalhado</div>
            </div>
            <span className="text-xs text-[var(--green)]">tempo real</span>
          </div>
        </div>

        {/* recorrências ativas */}
        <div className="bg-[var(--bg2)] rounded-xl p-5">
          <div className="text-sm font-medium mb-4">recorrências ativas</div>
          {recurrentTasks.length === 0 ? (
            <div className="text-sm text-[var(--muted)]">nenhuma recorrência ativa</div>
          ) : (
            recurrentTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                <div>
                  <div className="text-sm font-medium">{task.name}</div>
                  <div className="text-xs text-[var(--muted)] mt-0.5">
                    {task.recurDays.map(d => DAYS[d]).join(', ')}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await pauseRecurrence(task.id)
                    showToast('recorrência pausada — veja o arquivo para retomar')
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border2)] bg-transparent text-[var(--amber)] hover:bg-[var(--amber-bg)] cursor-pointer transition-colors"
                >
                  pausar
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}