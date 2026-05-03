import { useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { useLeisureStore } from '../../store/useLeisureStore'
import { useTaskStore } from '../../store/useTaskStore'
import { formatLeisureBalance } from '../../../utils/leisureCalc'
import { getCurrentStreak, getLast7Days } from '../../../utils/streak'

export function Sidebar() {
  const { currentPage, setCurrentPage, setCurCategory } = useAppStore()
  const { bank, activities } = useLeisureStore()
  const { tasks } = useTaskStore()

  const balanceText = bank ? formatLeisureBalance(bank.balance.minutes) : '0m'
  const streak = getCurrentStreak()
  const last7 = getLast7Days()

  useEffect(() => {
    useLeisureStore.getState().loadBank()
    useLeisureStore.getState().loadActivities()
  }, [])

  const totalTasks = tasks.filter(t => !t.archived).length
  const lazerCount = activities.length

  const catCounts: Record<string, number> = {
    'trabalho': tasks.filter(t => t.category === 'trabalho' && !t.archived).length,
    'faculdade': tasks.filter(t => t.category === 'faculdade' && !t.archived).length,
    'saúde e bem estar': tasks.filter(t => t.category === 'saúde e bem estar' && !t.archived).length,
    'formação pessoal': tasks.filter(t => t.category === 'formação pessoal' && !t.archived).length,
    'projetos pessoais': tasks.filter(t => t.category === 'projetos pessoais' && !t.archived).length,
  }

  function NavBtn({ id, label, badge, children }: { id: string, label: string, badge?: number, children: React.ReactNode }) {
    const active = currentPage === id
    return (
      <button
        onClick={() => setCurrentPage(id as any)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '5px 10px', borderRadius: 8, fontSize: 16,
          color: active ? '#ED93B1' : '#888',
          background: active ? '#4B1528' : 'transparent',
          fontWeight: active ? 500 : 400,
          border: 'none', width: '100%', cursor: 'pointer',
          transition: 'background .1s, color .1s',
          textAlign: 'left',
        }}
        onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#2a2a2a'; (e.currentTarget as HTMLElement).style.color = '#f0f0f0' } }}
        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#888' } }}
      >
        <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>{children}</span>
        <span>{label}</span>
        {badge !== undefined && (
          <span style={{
            marginLeft: 'auto', fontSize: 12,
            background: active ? '#72243E' : '#333',
            color: active ? '#F4C0D1' : '#888',
            padding: '2px 8px', borderRadius: 10,
          }}>{badge}</span>
        )}
      </button>
    )
  }

  function Icon({ children }: { children: React.ReactNode }) {
    return <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ width: 17, height: 17, flexShrink: 0 }}>{children}</svg>
  }

  return (
    <aside style={{ width: 280, minHeight: '100vh', background: '#222', borderRight: '.5px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>

      {/* brand */}
      <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '.5px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 18, fontWeight: 500, color: '#D4537E' }}>focusflow</div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 3 }}>gerenciamento de tempo</div>
      </div>

      {/* nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '.75rem .75rem 0', flex: 1 }}>
        <div style={{ fontSize: 11, color: '#888', padding: '.75rem .5rem .25rem', letterSpacing: '.06em', textTransform: 'uppercase' }}>visão geral</div>

        <NavBtn id="hoje" label="hoje">
          <Icon><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></Icon>
        </NavBtn>
        <NavBtn id="tasks" label="todas as tasks" badge={totalTasks}>
          <Icon><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>
        </NavBtn>
        <NavBtn id="lazer" label="lazer" badge={lazerCount}>
          <Icon><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></Icon>
        </NavBtn>
        <NavBtn id="calendario" label="calendário">
          <Icon><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></Icon>
        </NavBtn>
        <NavBtn id="stats" label="estatísticas">
          <Icon><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></Icon>
        </NavBtn>
        <NavBtn id="resumo" label="resumo semanal">
          <Icon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></Icon>
        </NavBtn>
        <NavBtn id="arquivo" label="arquivo">
          <Icon><polyline points="21,8 21,21 3,21 3,8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></Icon>
        </NavBtn>

        <div style={{ height: .5, background: 'rgba(255,255,255,0.08)', margin: '.5rem .75rem' }} />
        <div style={{ fontSize: 11, color: '#888', padding: '.25rem .5rem', letterSpacing: '.06em', textTransform: 'uppercase' }}>categorias</div>

        {Object.entries(catCounts).map(([cat, count]) => (
          <button
            key={cat}
            onClick={() => {
              setCurCategory(cat)
              setCurrentPage('tasks')
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 10px', borderRadius: 8, fontSize: 16, color: '#888', background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#2a2a2a'; (e.currentTarget as HTMLElement).style.color = '#f0f0f0' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#888' }}
          >
            <span style={{ opacity: 0.7, flexShrink: 0 }}>
              {cat === 'trabalho' && <Icon><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></Icon>}
              {cat === 'faculdade' && <Icon><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></Icon>}
              {cat === 'saúde e bem estar' && <Icon><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></Icon>}
              {cat === 'formação pessoal' && <Icon><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></Icon>}
              {cat === 'projetos pessoais' && <Icon><polygon points="12,2 2,7 12,12 22,7"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/></Icon>}
            </span>
            <span>{cat}</span>
            {count > 0 && <span style={{ marginLeft: 'auto', fontSize: 12, background: '#333', color: '#888', padding: '2px 8px', borderRadius: 10 }}>{count}</span>}
          </button>
        ))}

        <div style={{ height: .5, background: 'rgba(255,255,255,0.08)', margin: '.5rem .75rem' }} />

        <NavBtn id="settings" label="configurações">
          <Icon>
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </Icon>
        </NavBtn>
      </div>

      {/* banco de lazer */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '.5px solid rgba(255,255,255,0.08)' }}>
        <div style={{ background: '#4B1528', border: '.5px solid #72243E', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: '#ED93B1', marginBottom: 3, letterSpacing: '.04em', textTransform: 'uppercase' }}>banco de lazer</div>
          <div style={{ fontSize: 26, fontWeight: 500, color: '#D4537E', lineHeight: 1 }}>{balanceText}</div>
          <div style={{ fontSize: 13, color: '#993556', marginTop: 3 }}>acumulado · nunca expira</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 10 }}>
            {last7.map((d, i) => (
              <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: d.isToday && d.hasFocus ? '#ED93B1' : d.hasFocus ? '#D4537E' : '#333' }} />
            ))}
            <span style={{ fontSize: 13, color: '#D4537E', fontWeight: 500, marginLeft: 5 }}>{streak} dias</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 14 }}>
          <span style={{ color: '#888' }}>foco hoje</span>
          <span style={{ fontWeight: 500 }}>0m</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 14 }}>
          <span style={{ color: '#888' }}>tempo total</span>
          <span style={{ fontWeight: 500 }}>0m</span>
        </div>
      </div>
    </aside>
  )
}