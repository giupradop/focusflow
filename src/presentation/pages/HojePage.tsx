import { useEffect, useState } from 'react'
import { useTaskStore } from '../store/useTaskStore'
import { useAppStore } from '../store/useAppStore'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { TaskForm } from '../components/task/TaskForm'
import { FocusTimerCard } from '../components/task/FocusTimerCard'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { formatMinutes } from '../../utils/formatTime'
import { formatShortDate } from '../../utils/formatDate'
import type { Task } from '../../domain/task/Task'

export function HojePage() {
  const { todayTasks, overdueTasks, loadToday, archiveTask, createTask, updateTask } = useTaskStore()
  const { showToast } = useAppStore()

  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => { loadToday() }, [])

  async function confirmArchive() {
    if (!confirmId) return
    await archiveTask(confirmId)
    setConfirmId(null)
    showToast('tarefa arquivada')
    loadToday()
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

  function renderTable(list: Task[]) {
    if (!list.length) return null
    const visible = list.filter(t => !(activeTask && t.id === activeTask.id))
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 44 }}></th>
            <th style={thStyle}>tarefa</th>
            <th style={{ ...thStyle, width: 100 }}>prior.</th>
            <th style={{ ...thStyle, width: 160 }}>categoria</th>
            <th style={{ ...thStyle, width: 120 }}>vencimento</th>
            <th style={{ ...thStyle, width: 90 }}>estimado</th>
            <th style={{ ...thStyle, width: 44 }}></th>
          </tr>
        </thead>
        <tbody>
          {visible.map(task => (
            <tr
              key={task.id}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#222'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <td style={{ ...tdStyle, textAlign: 'center', width: 44 }}>
                {task.status !== 'concluída' && !activeTask ? (
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
                  style={{ fontWeight: 500, fontSize: 17, color: '#f0f0f0', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ED93B1'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#f0f0f0'}
                >
                  {task.name}
                </button>
              </td>
              <td style={tdStyle}>
                <Badge label={task.priority.toString()} variant="priority" value={task.priority.toString() as any} />
              </td>
              <td style={tdStyle}>
                <Badge label={task.category} variant="category" value={task.category as any} />
              </td>
              <td style={{ ...tdStyle, color: task.isOverdue ? '#E24B4A' : '#888' }}>
                {formatShortDate(task.dueDate)}
              </td>
              <td style={{ ...tdStyle, color: '#888' }}>
                {formatMinutes(task.estimatedMinutes)}
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
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* header */}
      <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: '.5px solid rgba(255,255,255,0.08)', background: '#1a1a1a', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 500 }}>hoje</h1>
            <p style={{ fontSize: 15, color: '#888', marginTop: 4 }}>
              {todayTasks.length} de hoje · {overdueTasks.length} atrasada(s)
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#D4537E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
          >
            + nova task
          </button>
        </div>
      </div>

      {/* body */}
      <div style={{ padding: '1.5rem 1.75rem', flex: 1 }}>
        {activeTask && (
          <FocusTimerCard
            task={activeTask}
            onClose={async () => { setActiveTask(null); await loadToday() }}
          />
        )}

        {todayTasks.length === 0 && overdueTasks.length === 0 && !activeTask ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#888', fontSize: 16 }}>
            nenhuma tarefa para hoje 🎉
          </div>
        ) : (
          <>
            {renderTable(todayTasks)}

            {overdueTasks.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.5rem 0 1rem' }}>
                  <div style={{ flex: 1, height: .5, background: 'rgba(255,255,255,0.08)' }} />
                  <span style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em' }}>atrasadas</span>
                  <div style={{ flex: 1, height: .5, background: 'rgba(255,255,255,0.08)' }} />
                </div>
                {renderTable(overdueTasks)}
              </>
            )}
          </>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="nova tarefa">
        <TaskForm
          onSubmit={async (data) => { await createTask(data as any); setShowForm(false); showToast('tarefa criada!'); loadToday() }}
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
            onSubmit={async (data) => { await updateTask({ id: editingTask.id, ...data as any }); setEditingTask(null); showToast('tarefa atualizada!'); loadToday() }}
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