import { useState } from 'react'
import { Category } from '../../../domain/task/Category'
import { useSlideAnimation } from '../../hooks/useSlideAnimation'

type TaskFormProps = {
  onSubmit: (data: {
    name: string
    category: string
    priorityLevel: string
    estimatedMinutes: number
    dueDate: Date
    notes: string
    recurrent: boolean
    recurDays: number[]
    createdAt: Date
  }) => void
  onCancel: () => void
  initialData?: {
    name: string
    category: string
    priority: string
    estimatedMinutes: number
    dueDate: Date
    notes: string
    recurrent: boolean
    recurDays: number[]
    createdAt: Date
  }
}

const DAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const CATEGORIES = Object.values(Category)
const PRIORITIES = ['alta', 'média', 'baixa']

export function TaskForm({ onSubmit, onCancel, initialData }: TaskFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [category, setCategory] = useState<string>(initialData?.category ?? CATEGORIES[0])
  const [priority, setPriority] = useState(initialData?.priority ?? 'média')
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialData?.estimatedMinutes ?? 60)
  const [dueDate, setDueDate] = useState(initialData?.dueDate ? initialData.dueDate.toISOString().slice(0, 10) : '')
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [recurrent, setRecurrent] = useState(initialData?.recurrent ?? false)
  const [recurDays, setRecurDays] = useState<number[]>(initialData?.recurDays ?? [])
  const [createdAt, setCreatedAt] = useState(initialData?.createdAt ? initialData.createdAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))
  const recurRef = useSlideAnimation(recurrent)

  function toggleDay(i: number) {
    setRecurDays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i])
  }

  function handleSubmit() {
    if (!name.trim() || !dueDate) return
    onSubmit({
      name: name.trim(), category, priorityLevel: priority,
      estimatedMinutes, dueDate: new Date(dueDate + 'T00:00:00'),
      notes, recurrent, recurDays,
      createdAt: new Date(createdAt + 'T00:00:00'),
    })
  }

  const inp: React.CSSProperties = {
    width: '100%', background: '#2a2a2a',
    border: '.5px solid rgba(255,255,255,0.15)',
    borderRadius: 8, padding: '10px 14px',
    fontSize: 15, color: '#f0f0f0',
    outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    fontSize: 11, color: '#888',
    textTransform: 'uppercase', letterSpacing: '.05em',
    marginBottom: 6, display: 'block',
  }

  const selectStyle: React.CSSProperties = {
  ...inp,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '36px',
}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      <div>
        <label style={lbl}>nome</label>
        <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="nome da tarefa" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lbl}>categoria</label>
          <select style={selectStyle} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#2a2a2a' }}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>prioridade</label>
          <select style={selectStyle} value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p} style={{ background: '#2a2a2a' }}>{p}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lbl}>estimado (min)</label>
          <input style={inp} type="number" min={5} step={5} value={estimatedMinutes} onChange={e => setEstimatedMinutes(+e.target.value)} />
        </div>
        <div>
          <label style={lbl}>data de criação</label>
          <input style={inp} type="date" value={createdAt} onChange={e => setCreatedAt(e.target.value)} />
        </div>
      </div>

      <div>
        <label style={lbl}>vencimento</label>
        <input style={inp} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      </div>

      <div>
        <label style={lbl}>observações</label>
        <textarea
          style={{ ...inp, resize: 'vertical', minHeight: 80, lineHeight: 1.6 }}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="anotações, detalhes, dúvidas..."
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox" id="recurrent" checked={recurrent}
          onChange={e => setRecurrent(e.target.checked)}
          style={{ width: 16, height: 16, accentColor: '#D4537E', cursor: 'pointer' }}
        />
        <label htmlFor="recurrent" style={{ fontSize: 15, color: '#888', cursor: 'pointer' }}>
          tarefa recorrente
        </label>
      </div>

      <div ref={recurRef} style={{ display: 'none' }}>
        <label style={{ ...lbl, marginBottom: 8 }}>repetir nos dias</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DAYS.map((d, i) => (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 14,
                cursor: 'pointer', fontFamily: 'inherit',
                background: recurDays.includes(i) ? '#4B1528' : 'transparent',
                color: recurDays.includes(i) ? '#ED93B1' : '#888',
                border: `.5px solid ${recurDays.includes(i) ? '#72243E' : 'rgba(255,255,255,0.15)'}`,
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          onClick={handleSubmit}
          style={{ padding: '10px 22px', background: '#D4537E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#993556'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#D4537E'}
        >
          {initialData ? 'salvar' : 'criar tarefa'}
        </button>
        <button
          onClick={onCancel}
          style={{ padding: '10px 18px', background: '#333', color: '#888', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f0f0f0'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#888'}
        >
          cancelar
        </button>
      </div>
    </div>
  )
}