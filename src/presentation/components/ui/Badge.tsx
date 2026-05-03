import type { Category } from '../../../domain/task/Category'
import type { TaskStatus } from '../../../domain/task/TaskStatus'

type BadgeVariant = 'category' | 'status' | 'priority'

type BadgeProps = {
  label: string
  variant: BadgeVariant
  value: Category | TaskStatus | 'alta' | 'média' | 'baixa'
}

const categoryColors: Record<string, string> = {
  'trabalho': 'bg-[#0c2340] text-[#85B7EB]',
  'faculdade': 'bg-[#1a2e10] text-[#97C459]',
  'saúde e bem estar': 'bg-[#0a2820] text-[#5DCAA5]',
  'formação pessoal': 'bg-[var(--pink-900)] text-[var(--pink-200)]',
  'projetos pessoais': 'bg-[#1e1a3a] text-[#AFA9EC]',
}

const statusColors: Record<string, string> = {
  'pendente': 'bg-[var(--bg4)] text-[var(--muted)]',
  'em andamento': 'bg-[var(--pink-900)] text-[var(--pink-200)]',
  'pausada': 'bg-[var(--amber-bg)] text-[var(--amber)]',
  'concluída': 'bg-[#1a2e10] text-[#97C459]',
  'atrasada': 'bg-[var(--red-bg)] text-[#F09595]',
  'arquivada': 'bg-[var(--bg4)] text-[var(--muted)]',
}

const priorityColors: Record<string, string> = {
  'alta': 'bg-[var(--red-bg)] text-[#F09595]',
  'média': 'bg-[var(--amber-bg)] text-[var(--amber)]',
  'baixa': 'bg-[var(--bg4)] text-[var(--muted)]',
}

export function Badge({ label, variant, value }: BadgeProps) {
  const colorMap = {
    category: categoryColors,
    status: statusColors,
    priority: priorityColors,
  }

  const color = colorMap[variant][value] ?? 'bg-[var(--bg4)] text-[var(--muted)]'

  return (
    <span
      style={{ fontSize: 16, padding: '3px 10px', borderRadius: 10, fontWeight: 500, whiteSpace: 'nowrap', display: 'inline-flex' }}
      className={color}
    >
      {label}
    </span>
  )
}