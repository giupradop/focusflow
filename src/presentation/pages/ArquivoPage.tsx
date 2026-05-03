import { useEffect } from 'react'
import { useTaskStore } from '../store/useTaskStore'
import { useAppStore } from '../store/useAppStore'
import { Badge } from '../components/ui/Badge'
import { formatShortDate } from '../../utils/formatDate'

export function ArquivoPage() {
  const { archivedTasks, loadArchived, restoreTask } = useTaskStore()
  const { showToast } = useAppStore()

  useEffect(() => {
    loadArchived()
  }, [])

  async function handleRestore(id: number) {
    await restoreTask(id)
    showToast('tarefa restaurada!')
    loadArchived()
  }

  const paused = archivedTasks.filter(t => t.recurrent && t.recurPaused)
  const archived = archivedTasks.filter(t => t.archived)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-7 pt-6 pb-4 border-b border-[var(--border)] bg-[var(--bg)] sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-medium">arquivo</h1>
          <p className="text-sm text-[var(--muted)] mt-1">tarefas arquivadas e recorrências pausadas</p>
        </div>
      </div>

      <div className="px-7 py-6 flex-1">

        {/* tarefas arquivadas */}
        <div className="bg-[var(--bg2)] rounded-xl p-5 mb-4">
          <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-4">
            tarefas arquivadas ({archived.length})
          </div>
          {archived.length === 0 ? (
            <div className="text-sm text-[var(--muted)]">nenhuma tarefa arquivada</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-xs text-[var(--muted)] font-medium px-2.5 py-1.5 border-b border-[var(--border)] uppercase tracking-wider">tarefa</th>
                  <th className="text-left text-xs text-[var(--muted)] font-medium px-2.5 py-1.5 border-b border-[var(--border)] uppercase tracking-wider w-32">categoria</th>
                  <th className="text-left text-xs text-[var(--muted)] font-medium px-2.5 py-1.5 border-b border-[var(--border)] uppercase tracking-wider w-20">criação</th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody>
                {archived.map(task => (
                  <tr key={task.id} className="border-b border-[var(--border)] hover:bg-[var(--bg3)] transition-colors">
                    <td className="px-2.5 py-2.5">
                      <div className="font-medium text-sm">{task.name}</div>
                      {task.notes && (
                        <div className="text-xs text-[var(--muted)] mt-0.5">{task.notes}</div>
                      )}
                    </td>
                    <td className="px-2.5 py-2.5">
                      <Badge label={task.category} variant="category" value={task.category as any} />
                    </td>
                    <td className="px-2.5 py-2.5 text-xs text-[var(--muted)]">
                      {formatShortDate(task.createdAt)}
                    </td>
                    <td className="px-2.5 py-2.5">
                      <button
                        onClick={() => handleRestore(task.id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border2)] bg-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg3)] cursor-pointer transition-colors"
                      >
                        restaurar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* recorrências pausadas */}
        <div className="bg-[var(--bg2)] rounded-xl p-5">
          <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-4">
            recorrências pausadas ({paused.length})
          </div>
          {paused.length === 0 ? (
            <div className="text-sm text-[var(--muted)]">nenhuma recorrência pausada</div>
          ) : (
            paused.map(task => (
              <div key={task.id} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                <div>
                  <div className="text-sm font-medium">{task.name}</div>
                  <div className="text-xs text-[var(--muted)] mt-0.5">
                    {task.recurDays.map(d => ['dom','seg','ter','qua','qui','sex','sáb'][d]).join(', ')}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await useTaskStore.getState().resumeRecurrence(task.id)
                    showToast('recorrência retomada!')
                    loadArchived()
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[var(--pink-400)] text-white border-none cursor-pointer hover:bg-[var(--pink-500)] transition-colors"
                >
                  retomar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}