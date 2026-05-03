import { useEffect, useState } from 'react'
import { useTaskStore } from '../store/useTaskStore'
import { useAppStore } from '../store/useAppStore'
import { useWeekNavigation } from '../hooks/useWeekNavigation'
import { Badge } from '../components/ui/Badge'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { formatMinutes } from '../../utils/formatTime'
import { formatShortDate } from '../../utils/formatDate'
import type { Task } from '../../domain/task/Task'
import { Modal } from '../components/ui/Modal'
import { TaskForm } from '../components/task/TaskForm'
import { FocusTimerCard } from '../components/task/FocusTimerCard'

type SortCol = 'priority' | 'due' | 'est' | 'spent' | null
type FilterTab = 'todas' | 'pendente' | 'em andamento' | 'pausada' | 'concluída' | 'atrasada'

const filters: FilterTab[] = ['todas', 'pendente', 'em andamento', 'pausada', 'concluída', 'atrasada']

export function TasksPage() {
  const { tasks, carriedTasks, loadWeek, archiveTask, createTask, updateTask } = useTaskStore()
  const { showToast } = useAppStore()
  const { weekOffset, weekLabel, goToPrevWeek, goToNextWeek } = useWeekNavigation()
  const { curCategory } = useAppStore()

  const [filter, setFilter] = useState<FilterTab>('todas')
  const [sortCol, setSortCol] = useState<SortCol>(null)
  const [sortDir, setSortDir] = useState<1 | -1>(1)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    loadWeek(weekOffset, curCategory as any)
  }, [weekOffset, curCategory])

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
        va = a.dueDate.getTime(); vb = b.dueDate.getTime()
      } else if (sortCol === 'est') {
        va = a.estimatedMinutes; vb = b.estimatedMinutes
      } else {
        va = a.totalSpentSeconds; vb = b.totalSpentSeconds
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

  async function confirmArchive() {
    if (!confirmId) return
    await archiveTask(confirmId)
    setConfirmId(null)
    showToast('tarefa arquivada')
  }

  const thStyle: React.CSSProperties = {
    fontSize: 15, color: '#888', fontWeight: 500, textAlign: 'left',
    padding: '10px 16px', borderBottom: '.5px solid rgba(255,255,255,0.08)',
    letterSpacing: '.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
  }
  const tdStyle: React.CSSProperties = {
    padding: '15px 16px', borderBottom: '.5px solid rgba(255,255,255,0.08)',
    fontSize: 17, verticalAlign: 'middle',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* header */}
      <div style={{ padding: '1.5rem 1.75rem 0', borderBottom: '.5px solid rgba(255,255,255,0.08)', background: '#1a1a1a', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 500 }}>
              {curCategory ?? 'todas as tasks'}
            </h1>
            <p style={{ fontSize: 16, color: '#888', marginTop: 4 }}>{allTasks.length} tarefa(s) nesta semana</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#D4537E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 18, fontWeight: 500, cursor: 'pointer' }}
          >
            + nova task
          </button>
        </div>

        {/* week nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
          <button onClick={goToPrevWeek} style={{ background: 'transparent', border: '.5px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#888', padding: '6px 14px', cursor: 'pointer', fontSize: 15 }}>←</button>
          <span style={{ fontSize: 18, fontWeight: 500, minWidth: 200, textAlign: 'center' }}>{weekLabel}</span>
          <button onClick={goToNextWeek} style={{ background: 'transparent', border: '.5px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#888', padding: '6px 14px', cursor: 'pointer', fontSize: 15 }}>→</button>
        </div>

        {/* filter tabs */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 18px',
                borderRadius: '8px 8px 0 0',
                fontSize: 17,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: filter === f ? '#1a1a1a' : 'transparent',
                color: filter === f ? '#ED93B1' : '#888',
                fontWeight: filter === f ? 500 : 400,
                border: filter === f ? '.5px solid rgba(255,255,255,0.15)' : '.5px solid transparent',
                borderBottom: filter === f ? '1px solid #1a1a1a' : 'none',
                marginBottom: filter === f ? -1 : 0,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* body */}
      <div style={{ padding: '1.5rem 1.75rem', flex: 1 }}>
        {activeTask && (
          <FocusTimerCard
            task={activeTask}
            onClose={async () => { setActiveTask(null); await loadWeek(weekOffset) }}
          />
        )}

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#888', fontSize: 20 }}>
            nenhuma tarefa nesta semana
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 44 }}></th>
                <th style={thStyle}>tarefa</th>
                <th style={{ ...thStyle, cursor: 'pointer', width: 100 }} onClick={() => handleSort('priority')}>prior.{sortArrow('priority')}</th>
                <th style={{ ...thStyle, width: 160 }}>categoria</th>
                <th style={{ ...thStyle, width: 70 }}>criação</th>
                <th style={{ ...thStyle, cursor: 'pointer', width: 120 }} onClick={() => handleSort('due')}>vencimento{sortArrow('due')}</th>
                <th style={{ ...thStyle, cursor: 'pointer', width: 90 }} onClick={() => handleSort('est')}>estimado{sortArrow('est')}</th>
                <th style={{ ...thStyle, cursor: 'pointer', width: 80 }} onClick={() => handleSort('spent')}>gasto{sortArrow('spent')}</th>
                <th style={{ ...thStyle, width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => {
                const carried = carriedTasks.some(t => t.id === task.id)
                return (
                  <tr
                    key={task.id}
                    style={{ opacity: carried ? 0.72 : 1 }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#222'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ ...tdStyle, textAlign: 'center', width: 44 }}>
                      {task.status !== 'concluída' && task.status !== 'arquivada' && !activeTask ? (
                        <button
                          onClick={() => setActiveTask(task)}
                          style={{ width: 30, height: 30, borderRadius: '50%', border: '.5px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#888', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#4B1528'; el.style.color = '#D4537E'; el.style.borderColor = '#72243E' }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = '#888'; el.style.borderColor = 'rgba(255,255,255,0.08)' }}
                        >▶</button>
                      ) : task.status === 'concluída' ? (
                        <span style={{ color: '#5DCAA5', fontSize: 18 }}>✓</span>
                      ) : null}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => setEditingTask(task)}
                        style={{ fontWeight: 500, fontSize: 18, color: '#f0f0f0', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ED93B1'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#f0f0f0'}
                      >
                        {task.name}
                      </button>
                      {carried && (
                        <span style={{ fontSize: 15, background: '#333', color: '#888', padding: '2px 7px', borderRadius: 6, marginLeft: 8 }}>arrastada</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <Badge label={task.priority.toString()} variant="priority" value={task.priority.toString() as any} />
                    </td>
                    <td style={tdStyle}>
                      <Badge label={task.category} variant="category" value={task.category as any} />
                    </td>
                    <td style={{ ...tdStyle, fontSize: 17, color: '#888' }}>{formatShortDate(task.createdAt)}</td>
                    <td style={{ ...tdStyle, color: task.isOverdue ? '#E24B4A' : '#888' }}>{formatShortDate(task.dueDate)}</td>
                    <td style={{ ...tdStyle, color: '#888' }}>{formatMinutes(task.estimatedMinutes)}</td>
                    <td style={{ ...tdStyle, fontSize: 17, color: '#5DCAA5' }}>
                      {task.totalSpentSeconds > 0 ? formatMinutes(task.totalSpentSeconds / 60) : '—'}
                    </td>
                    <td style={{ ...tdStyle, width: 44 }}>
                      <button
                        onClick={() => setConfirmId(task.id)}
                        style={{ width: 30, height: 30, borderRadius: 6, border: '.5px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#888', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#2e1010'; el.style.color = '#F09595' }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = '#888' }}
                        title="arquivar"
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><polyline points="21,8 21,21 3,21 3,8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
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
          onSubmit={async (data) => { await createTask(data as any); setShowForm(false); showToast('tarefa criada!') }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <Modal isOpen={editingTask !== null} onClose={() => setEditingTask(null)} title="editar tarefa">
        {editingTask && (
          <TaskForm
            initialData={{
              name: editingTask.name, category: editingTask.category,
              priority: editingTask.priority.toString(),
              estimatedMinutes: editingTask.estimatedMinutes,
              dueDate: editingTask.dueDate, notes: editingTask.notes,
              recurrent: editingTask.recurrent, recurDays: editingTask.recurDays,
              createdAt: editingTask.createdAt,
            }}
            onSubmit={async (data) => { await updateTask({ id: editingTask.id, ...data as any }); setEditingTask(null); showToast('tarefa atualizada!') }}
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