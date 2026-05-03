import { useEffect, useState } from 'react'
import { useTaskStore } from '../store/useTaskStore'
import { useAppStore } from '../store/useAppStore'
import { useWeekNavigation } from '../hooks/useWeekNavigation'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { formatMinutes } from '../../utils/formatTime'
import { formatShortDate } from '../../utils/formatDate'
import type { Task } from '../../domain/task/Task'
import { Modal } from '../components/ui/Modal'
import { TaskForm } from '../components/task/TaskForm'
import { FocusTimerCard } from '../components/task/FocusTimerCard'

type SortCol = 'priority' | 'due' | 'est' | 'spent' | null
type FilterTab = 'todas' | 'pendente' | 'em andamento' | 'pausada' | 'concluída' | 'atrasada'

export function TasksPage() {
  const { tasks, carriedTasks, loadWeek, archiveTask, createTask, updateTask } = useTaskStore()
  const { showToast } = useAppStore()
  const { weekOffset, weekLabel, goToPrevWeek, goToNextWeek } = useWeekNavigation()

  const [filter, setFilter] = useState<FilterTab>('todas')
  const [sortCol, setSortCol] = useState<SortCol>(null)
  const [sortDir, setSortDir] = useState<1 | -1>(1)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    loadWeek(weekOffset)
  }, [weekOffset])

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === 1 ? -1 : 1)
    else { setSortCol(col); setSortDir(1) }
  }

  function sortArrow(col: SortCol) {
    if (sortCol !== col) return ' ↕'
    return sortDir === 1 ? ' ↑' : ' ↓'
  }

  function applySort(list: Task[]): Task[] {
    if (!sortCol) return list
    return [...list].sort((a, b) => {
      let va: number, vb: number
      if (sortCol === 'priority') {
        const o: Record<string, number> = { alta: 0, média: 1, baixa: 2 }
        va = o[a.priority.toString()] ?? 3
        vb = o[b.priority.toString()] ?? 3
      } else if (sortCol === 'due') {
        va = a.dueDate.getTime()
        vb = b.dueDate.getTime()
      } else if (sortCol === 'est') {
        va = a.estimatedMinutes
        vb = b.estimatedMinutes
      } else {
        va = a.totalSpentSeconds
        vb = b.totalSpentSeconds
      }
      return (va - vb) * sortDir
    })
  }

  function applyFilter(list: Task[]): Task[] {
    if (filter === 'todas') return list
    if (filter === 'atrasada') return list.filter(t => t.isOverdue)
    return list.filter(t => t.status === filter)
  }

  const allTasks = [...tasks, ...carriedTasks]
  const filtered = applySort(applyFilter(allTasks))

  const filters: FilterTab[] = ['todas', 'pendente', 'em andamento', 'pausada', 'concluída', 'atrasada']

  function handleArchive(id: number) { setConfirmId(id) }

  async function confirmArchive() {
    if (!confirmId) return
    await archiveTask(confirmId)
    setConfirmId(null)
    showToast('tarefa arquivada')
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* header */}
      <div className="px-7 pt-6 pb-0 border-b border-[var(--border)] bg-[var(--bg)] sticky top-0 z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-medium">todas as tasks</h1>
            <p className="text-sm text-[var(--muted)] mt-1">{allTasks.length} tarefa(s) nesta semana</p>
          </div>
          <Button label="+ nova task" onClick={() => setShowForm(true)} />
        </div>

        {/* week nav */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={goToPrevWeek} className="wbtn">←</button>
          <span className="text-sm font-medium min-w-[200px] text-center">{weekLabel}</span>
          <button onClick={goToNextWeek} className="wbtn">→</button>
        </div>

        {/* filters */}
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-t-lg text-xs border-b-0 cursor-pointer whitespace-nowrap transition-colors
                ${filter === f
                  ? 'bg-[var(--bg)] text-[var(--pink-200)] font-medium border border-[var(--border2)] mb-[-1px]'
                  : 'bg-transparent text-[var(--muted)] border border-transparent hover:text-[var(--text)]'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* body */}
      <div className="px-7 py-6 flex-1">
        {activeTask && (
            <FocusTimerCard
              task={activeTask}
              onClose={async () => {
              setActiveTask(null)
              await loadWeek(weekOffset)
            }}
            />
          )}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted)] text-sm">
            nenhuma tarefa nesta semana
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-9"></th>
                <th className="text-left text-xs text-[var(--muted)] font-medium px-2.5 py-1.5 border-b border-[var(--border)] uppercase tracking-wider">tarefa</th>
                <th className="text-left text-xs text-[var(--muted)] font-medium px-2.5 py-1.5 border-b border-[var(--border)] uppercase tracking-wider cursor-pointer w-20" onClick={() => handleSort('priority')}>prior.{sortArrow('priority')}</th>
                <th className="text-left text-xs text-[var(--muted)] font-medium px-2.5 py-1.5 border-b border-[var(--border)] uppercase tracking-wider w-32">categoria</th>
                <th className="text-left text-xs text-[var(--muted)] font-medium px-2.5 py-1.5 border-b border-[var(--border)] uppercase tracking-wider w-14">criação</th>
                <th className="text-left text-xs text-[var(--muted)] font-medium px-2.5 py-1.5 border-b border-[var(--border)] uppercase tracking-wider cursor-pointer w-24" onClick={() => handleSort('due')}>vencimento{sortArrow('due')}</th>
                <th className="text-left text-xs text-[var(--muted)] font-medium px-2.5 py-1.5 border-b border-[var(--border)] uppercase tracking-wider cursor-pointer w-16" onClick={() => handleSort('est')}>estimado{sortArrow('est')}</th>
                <th className="text-left text-xs text-[var(--muted)] font-medium px-2.5 py-1.5 border-b border-[var(--border)] uppercase tracking-wider cursor-pointer w-14" onClick={() => handleSort('spent')}>gasto{sortArrow('spent')}</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => {
                const carried = carriedTasks.some(t => t.id === task.id)
                return (
                  <tr
                    key={task.id}
                    className={`border-b border-[var(--border)] hover:bg-[var(--bg2)] transition-colors ${carried ? 'opacity-70' : ''}`}
                  >
                    <td className="px-2.5 py-2.5 text-center">
                        {task.status !== 'concluída' && task.status !== 'arquivada' && !activeTask ? (
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
                      <button
                        className="font-medium text-sm text-left text-[var(--text)] hover:text-[var(--pink-200)] bg-transparent border-none cursor-pointer p-0 w-full"
                        onClick={() => setEditingTask(task)}
                      >
                        {task.name}
                      </button>
                      {carried && (
                        <span className="text-[10px] bg-[var(--bg4)] text-[var(--muted)] px-1.5 py-0.5 rounded ml-1.5">
                          arrastada
                        </span>
                      )}
                    </td>
                    <td className="px-2.5 py-2.5">
                      <Badge label={task.priority.toString()} variant="priority" value={task.priority.toString() as any} />
                    </td>
                    <td className="px-2.5 py-2.5">
                      <Badge label={task.category} variant="category" value={task.category as any} />
                    </td>
                    <td className="px-2.5 py-2.5 text-xs text-[var(--muted)]">
                      {formatShortDate(task.createdAt)}
                    </td>
                    <td className={`px-2.5 py-2.5 text-sm ${task.isOverdue ? 'text-[var(--red)]' : 'text-[var(--muted)]'}`}>
                      {formatShortDate(task.dueDate)}
                    </td>
                    <td className="px-2.5 py-2.5 text-sm text-[var(--muted)]">
                      {formatMinutes(task.estimatedMinutes)}
                    </td>
                    <td className="px-2.5 py-2.5 text-xs text-[var(--green)]">
                      {task.totalSpentSeconds > 0 ? formatMinutes(task.totalSpentSeconds / 60) : '—'}
                    </td>
                    <td className="px-2.5 py-2.5">
                      <button
                        onClick={() => handleArchive(task.id)}
                        className="w-7 h-7 rounded-md border border-[var(--border)] bg-transparent text-[var(--muted)] hover:bg-[var(--red-bg)] hover:text-[#F09595] flex items-center justify-center cursor-pointer text-xs"
                        title="arquivar"
                      >
                        🗃
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

  <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="nova tarefa">
    <TaskForm
      onSubmit={async (data) => {
        await createTask(data as any)
        setShowForm(false)
        showToast('tarefa criada!')
      }}
      onCancel={() => setShowForm(false)}
    />
  </Modal>

  <Modal isOpen={editingTask !== null} onClose={() => setEditingTask(null)} title="editar tarefa">
    {editingTask && (
      <TaskForm
        initialData={{
          name: editingTask.name,
          category: editingTask.category,
          priority: editingTask.priority.toString(),
          estimatedMinutes: editingTask.estimatedMinutes,
          dueDate: editingTask.dueDate,
          notes: editingTask.notes,
          recurrent: editingTask.recurrent,
          recurDays: editingTask.recurDays,
          createdAt: editingTask.createdAt,
        }}
        onSubmit={async (data) => {
          await updateTask({ id: editingTask.id, ...data as any })
          setEditingTask(null)
          showToast('tarefa atualizada!')
        }}
        onCancel={() => setEditingTask(null)}
      />
    )}
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