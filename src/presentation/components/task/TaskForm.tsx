import { useState } from 'react'
import { Button } from '../ui/Button'
import { Category } from '../../../domain/task/Category'

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
}

const DAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const CATEGORIES = Object.values(Category)
const PRIORITIES = ['alta', 'média', 'baixa']

export function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [priority, setPriority] = useState('média')
  const [estimatedMinutes, setEstimatedMinutes] = useState(60)
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [recurrent, setRecurrent] = useState(false)
  const [recurDays, setRecurDays] = useState<number[]>([])
  const [createdAt, setCreatedAt] = useState(new Date().toISOString().slice(0, 10))

  function toggleDay(i: number) {
    setRecurDays(prev =>
      prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]
    )
  }

  function handleSubmit() {
    if (!name.trim()) return
    if (!dueDate) return
    onSubmit({
      name: name.trim(),
      category,
      priorityLevel: priority,
      estimatedMinutes,
      dueDate: new Date(dueDate + 'T00:00:00'),
      notes,
      recurrent,
      recurDays,
      createdAt: new Date(createdAt + 'T00:00:00'),
    })
  }

  const inputCls = 'w-full bg-[var(--bg4)] border border-[var(--border2)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--pink-500)]'
  const labelCls = 'text-[11px] text-[var(--muted)] uppercase tracking-wider mb-1 block'

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={labelCls}>nome</label>
        <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="nome da tarefa" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>categoria</label>
          <select className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>prioridade</label>
          <select className={inputCls} value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>estimado (min)</label>
          <input className={inputCls} type="number" min={5} step={5} value={estimatedMinutes} onChange={e => setEstimatedMinutes(+e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>data de criação</label>
          <input className={inputCls} type="date" value={createdAt} onChange={e => setCreatedAt(e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelCls}>vencimento</label>
        <input className={inputCls} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      </div>

      <div>
        <label className={labelCls}>observações</label>
        <textarea className={`${inputCls} resize-y min-h-[72px] leading-relaxed`} value={notes} onChange={e => setNotes(e.target.value)} placeholder="anotações, detalhes, dúvidas..." />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="recurrent" checked={recurrent} onChange={e => setRecurrent(e.target.checked)} className="w-4 h-4 accent-[var(--pink-400)]" />
        <label htmlFor="recurrent" className="text-sm text-[var(--muted)] cursor-pointer">tarefa recorrente</label>
      </div>

      {recurrent && (
        <div>
          <label className={labelCls}>repetir nos dias</label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((d, i) => (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className={`px-3 py-1 rounded-md text-xs border cursor-pointer transition-colors
                  ${recurDays.includes(i)
                    ? 'bg-[var(--pink-900)] text-[var(--pink-200)] border-[var(--pink-800)]'
                    : 'bg-transparent text-[var(--muted)] border-[var(--border2)]'
                  }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <Button label="criar tarefa" onClick={handleSubmit} />
        <Button label="cancelar" onClick={onCancel} variant="secondary" />
      </div>
    </div>
  )
}