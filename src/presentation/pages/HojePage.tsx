import { useEffect, useState } from 'react'
import { useTaskStore } from '../store/useTaskStore'
import { useAppStore } from '../store/useAppStore'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { TaskForm } from '../components/task/TaskForm'
import { FocusTimerCard } from '../components/task/FocusTimerCard'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { formatMinutes } from '../../utils/formatTime'
import { formatShortDate } from '../../utils/formatDate'
import type { Task } from '../../domain/task/Task'

export function HojePage() {
  const { todayTasks, overdueTasks, loadToday, archiveTask, createTask } = useTaskStore()
  const { showToast } = useAppStore()

  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  useEffect(() => {
    loadToday()
  }, [])

  async function confirmArchive() {
    if (!confirmId) return
    await archiveTask(confirmId)
    setConfirmId(null)
    showToast('tarefa arquivada')
    loadToday()
  }

  function renderTable(list: Task[]) {
    if (!list.length) return null
    return (
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-9"></th>
            <th className="text-left text-xs text-[var(--muted)] font-medium px-2.5 py-1.5 border-b border-[var(--border)] uppercase tracking-wider">tarefa</th>
            <th className="text-left text-xs text-[var(--muted)] font-medium px-2.5 py-1.5 border-b border-[var(--border)] uppercase tracking-wider w-20">prior.</th>
            <th className="text-left text-xs text-[var(--muted)] font-medium px-2.5 py-1.5 border-b border-[var(--border)] uppercase tracking-wider w-32">categoria</th>
            <th className="text-left text-xs text-[var(--muted)] font-medium px-2.5 py-1.5 border-b border-[var(--border)] uppercase tracking-wider w-24">vencimento</th>
            <th className="text-left text-xs text-[var(--muted)] font-medium px-2.5 py-1.5 border-b border-[var(--border)] uppercase tracking-wider w-16">estimado</th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {list.filter(t => !(activeTask && t.id === activeTask.id)).map(task => (
            <tr key={task.id} className="border-b border-[var(--border)] hover:bg-[var(--bg2)] transition-colors">
              <td className="px-2.5 py-2.5 text-center">
                {task.status !== 'concluída' && !activeTask ? (
                  <button
                    onClick={() => setActiveTask(task)}
                    className="w-7 h-7 rounded-full border border-[var(--border)] bg-transparent text-[var(--muted)] hover:bg-[var(--pink-900)] hover:text-[var(--pink-400)] hover:border-[var(--pink-800)] flex items-center justify-center cursor-pointer text-xs"
                  >
                    ▶
                  </button>
                ) : task.status === 'concluída' ? (
                  <span className="text-[var(--green)] text-sm">✓</span>
                ) : null}
              </td>
              <td className="px-2.5 py-2.5">
                <span className="font-medium text-sm">{task.name}</span>
              </td>
              <td className="px-2.5 py-2.5">
                <Badge label={task.priority.toString()} variant="priority" value={task.priority.toString() as any} />
              </td>
              <td className="px-2.5 py-2.5">
                <Badge label={task.category} variant="category" value={task.category as any} />
              </td>
              <td className={`px-2.5 py-2.5 text-sm ${task.isOverdue ? 'text-[var(--red)]' : 'text-[var(--muted)]'}`}>
                {formatShortDate(task.dueDate)}
              </td>
              <td className="px-2.5 py-2.5 text-sm text-[var(--muted)]">
                {formatMinutes(task.estimatedMinutes)}
              </td>
              <td className="px-2.5 py-2.5">
                <button
                  onClick={() => setConfirmId(task.id)}
                  className="w-7 h-7 rounded-md border border-[var(--border)] bg-transparent text-[var(--muted)] hover:bg-[var(--red-bg)] hover:text-[#F09595] flex items-center justify-center cursor-pointer text-xs"
                  title="arquivar"
                >
                  🗃
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-7 pt-6 pb-4 border-b border-[var(--border)] bg-[var(--bg)] sticky top-0 z-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-medium">hoje</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              {todayTasks.length} de hoje · {overdueTasks.length} atrasada(s)
            </p>
          </div>
          <Button label="+ nova task" onClick={() => setShowForm(true)} />
        </div>
      </div>

      <div className="px-7 py-6 flex-1">
        {activeTask && (
          <FocusTimerCard
            task={activeTask}
            onClose={async () => {
              setActiveTask(null)
              await loadToday()
            }}
          />
        )}

        {todayTasks.length === 0 && overdueTasks.length === 0 && !activeTask ? (
          <div className="text-center py-16 text-[var(--muted)] text-sm">
            nenhuma tarefa para hoje 🎉
          </div>
        ) : (
          <>
            {renderTable(todayTasks)}

            {overdueTasks.length > 0 && (
              <>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-xs text-[var(--muted)] uppercase tracking-widest">atrasadas</span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>
                {renderTable(overdueTasks)}
              </>
            )}
          </>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="nova tarefa">
        <TaskForm
          onSubmit={async (data) => {
            await createTask(data as any)
            setShowForm(false)
            showToast('tarefa criada!')
            loadToday()
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={confirmId !== null}
        title="arquivar tarefa?"
        message="a tarefa será movida para o arquivo. você pode restaurá-la a qualquer momento."
        onConfirm={confirmArchive}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}