import { useAppStore } from '../../store/useAppStore'
import { useLeisureStore } from '../../store/useLeisureStore'
import { formatLeisureBalance } from '../../../utils/leisureCalc'

const navItems = [
  { id: 'hoje', label: 'hoje', icon: '🕐' },
  { id: 'tasks', label: 'todas as tasks', icon: '⊞' },
  { id: 'lazer', label: 'lazer', icon: '★' },
  { id: 'calendario', label: 'calendário', icon: '📅' },
  { id: 'stats', label: 'estatísticas', icon: '📊' },
  { id: 'resumo', label: 'resumo semanal', icon: '📄' },
  { id: 'arquivo', label: 'arquivo', icon: '🗃' },
] as const

const categoryItems = [
  { id: 'trabalho', label: 'trabalho', icon: '💼' },
  { id: 'faculdade', label: 'faculdade', icon: '🎓' },
  { id: 'saude', label: 'saúde e bem estar', icon: '🏃' },
  { id: 'pessoal', label: 'formação pessoal', icon: '👤' },
  { id: 'projetos', label: 'projetos pessoais', icon: '🗂' },
] as const

export function Sidebar() {
  const { currentPage, setCurrentPage } = useAppStore()
  const { bank } = useLeisureStore()

  const balanceText = bank ? formatLeisureBalance(bank.balance.minutes) : '0m'

  return (
    <aside className="w-[252px] min-h-screen bg-[var(--bg2)] border-r border-[var(--border)] flex flex-col sticky top-0 h-screen overflow-y-auto">

      {/* brand */}
      <div className="px-5 pt-5 pb-4 border-b border-[var(--border)]">
        <div className="text-base font-medium text-[var(--pink-400)]">focusflow</div>
        <div className="text-xs text-[var(--muted)] mt-0.5">gerenciamento de tempo</div>
      </div>

      {/* nav */}
      <div className="flex flex-col gap-0.5 px-3 pt-3 flex-1">
        <div className="text-[10px] text-[var(--muted)] px-2 pt-3 pb-1 uppercase tracking-widest">visão geral</div>

        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id as any)}
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm w-full text-left border-none cursor-pointer transition-colors
              ${currentPage === item.id
                ? 'bg-[var(--pink-900)] text-[var(--pink-200)] font-medium'
                : 'bg-transparent text-[var(--muted)] hover:bg-[var(--bg3)] hover:text-[var(--text)]'
              }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        <div className="h-px bg-[var(--border)] my-2" />
        <div className="text-[10px] text-[var(--muted)] px-2 pt-1 pb-1 uppercase tracking-widest">categorias</div>

        {categoryItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage('tasks' as any)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm w-full text-left border-none cursor-pointer bg-transparent text-[var(--muted)] hover:bg-[var(--bg3)] hover:text-[var(--text)] transition-colors"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        <div className="h-px bg-[var(--border)] my-2" />

        <button
          onClick={() => setCurrentPage('settings' as any)}
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm w-full text-left border-none cursor-pointer transition-colors
            ${currentPage === 'settings'
              ? 'bg-[var(--pink-900)] text-[var(--pink-200)] font-medium'
              : 'bg-transparent text-[var(--muted)] hover:bg-[var(--bg3)] hover:text-[var(--text)]'
            }`}
        >
          <span>⚙</span>
          <span>configurações</span>
        </button>
      </div>

      {/* banco de lazer */}
      <div className="px-5 py-4 border-t border-[var(--border)]">
        <div className="bg-[var(--pink-900)] border border-[var(--pink-800)] rounded-xl p-3 mb-3">
          <div className="text-[10px] text-[var(--pink-200)] mb-0.5 uppercase tracking-wider">banco de lazer</div>
          <div className="text-2xl font-medium text-[var(--pink-400)]">{balanceText}</div>
          <div className="text-xs text-[var(--pink-500)] mt-0.5">acumulado · nunca expira</div>
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-sm ${i < 3 ? 'bg-[var(--pink-400)]' : 'bg-[var(--bg4)]'} ${i === 6 ? 'bg-[var(--pink-200)]' : ''}`}
              />
            ))}
            <span className="text-xs text-[var(--pink-400)] font-medium ml-1">3 dias</span>
          </div>
        </div>
        <div className="flex justify-between text-xs py-1">
          <span className="text-[var(--muted)]">foco hoje</span>
          <span className="font-medium">0m</span>
        </div>
        <div className="flex justify-between text-xs py-1">
          <span className="text-[var(--muted)]">tempo total</span>
          <span className="font-medium">0m</span>
        </div>
      </div>
    </aside>
  )
}