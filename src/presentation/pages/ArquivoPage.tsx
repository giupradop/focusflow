import { useEffect } from 'react'
import { useTaskStore } from '../store/useTaskStore'
import { useAppStore } from '../store/useAppStore'
import { Badge } from '../components/ui/Badge'
import { formatShortDate } from '../../utils/formatDate'

export function ArquivoPage() {
  const { archivedTasks, loadArchived, restoreTask } = useTaskStore()
  const { showToast } = useAppStore()

  useEffect(() => { loadArchived() }, [])

  async function handleRestore(id: number) {
    await restoreTask(id)
    showToast('tarefa restaurada!')
    loadArchived()
  }

  const paused   = archivedTasks.filter(t => t.recurrent && t.recurPaused)
  const archived = archivedTasks.filter(t => t.archived)

  const border  = '.5px solid rgba(255,255,255,0.08)'
  const cardStyle: React.CSSProperties = { background: '#222', borderRadius: 12, border, padding: '1.25rem 1.5rem', marginBottom: 16 }
  const sectionLabel: React.CSSProperties = { fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16, fontWeight: 500 }
  const thStyle: React.CSSProperties = { fontSize: 13, color: '#888', fontWeight: 500, textAlign: 'left', padding: '8px 12px', borderBottom: border, letterSpacing: '.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }
  const tdStyle: React.CSSProperties = { padding: '14px 12px', borderBottom: border, fontSize: 17, verticalAlign: 'middle' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* header */}
      <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: border, background: '#1a1a1a', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: 28, fontWeight: 500 }}>arquivo</h1>
        <p style={{ fontSize: 16, color: '#888', marginTop: 4 }}>tarefas arquivadas e recorrências pausadas</p>
      </div>

      <div style={{ padding: '1.5rem 1.75rem', flex: 1 }}>

        {/* tarefas arquivadas */}
        <div style={cardStyle}>
          <div style={sectionLabel}>tarefas arquivadas ({archived.length})</div>
          {archived.length === 0 ? (
            <div style={{ fontSize: 16, color: '#888' }}>nenhuma tarefa arquivada</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>tarefa</th>
                  <th style={{ ...thStyle, width: 160 }}>categoria</th>
                  <th style={{ ...thStyle, width: 90 }}>criação</th>
                  <th style={{ ...thStyle, width: 100 }}></th>
                </tr>
              </thead>
              <tbody>
                {archived.map(task => (
                  <tr
                    key={task.id}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#2a2a2a'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 500, fontSize: 17 }}>{task.name}</div>
                      {task.notes && (
                        <div style={{ fontSize: 14, color: '#888', marginTop: 2 }}>{task.notes}</div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <Badge label={task.category} variant="category" value={task.category as any} />
                    </td>
                    <td style={{ ...tdStyle, fontSize: 15, color: '#888' }}>
                      {formatShortDate(task.createdAt)}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleRestore(task.id)}
                        style={{ fontSize: 15, padding: '6px 14px', borderRadius: 8, border, background: 'transparent', color: '#888', cursor: 'pointer' }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#2a2a2a'; el.style.color = '#f0f0f0' }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = '#888' }}
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
        <div style={{ ...cardStyle, marginBottom: 0 }}>
          <div style={sectionLabel}>recorrências pausadas ({paused.length})</div>
          {paused.length === 0 ? (
            <div style={{ fontSize: 16, color: '#888' }}>nenhuma recorrência pausada</div>
          ) : paused.map((task, i) => (
            <div
              key={task.id}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < paused.length - 1 ? border : 'none' }}
            >
              <div>
                <div style={{ fontSize: 17, fontWeight: 500 }}>{task.name}</div>
                <div style={{ fontSize: 14, color: '#888', marginTop: 3 }}>
                  {task.recurDays.map((d: number) => ['dom','seg','ter','qua','qui','sex','sáb'][d]).join(', ')}
                </div>
              </div>
              <button
                onClick={async () => {
                  await useTaskStore.getState().resumeRecurrence(task.id)
                  showToast('recorrência retomada!')
                  loadArchived()
                }}
                style={{ fontSize: 15, padding: '8px 18px', borderRadius: 8, background: '#D4537E', color: '#fff', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#c4476e'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#D4537E'}
              >
                retomar
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}