import React from 'react'
import { useAppStore } from '../store/useAppStore'
import { Sidebar } from '../components/layout/Sidebar'
import { Toast } from '../components/ui/Toast'
import { HojePage } from './HojePage'
import { TasksPage } from './TasksPage'
import { LazerPage } from './LazerPage'
import { ArquivoPage } from './ArquivoPage'
import { ConfiguracoesPage } from './ConfiguracoesPage'
import { CalendarioPage } from './CalendarioPage'
import { EstatisticasPage } from './EstatisticasPage'
import { ResumoPage } from './ResumoPage'

export function App() {
  const { currentPage, toast, hideToast } = useAppStore()

  const pages: Record<string, React.ReactNode> = {
    hoje: <HojePage />,
    tasks: <TasksPage />,
    lazer: <LazerPage />,
    calendario: <CalendarioPage />,
    stats: <EstatisticasPage />,
    resumo: <ResumoPage />,
    arquivo: <ArquivoPage />,
    settings: <ConfiguracoesPage />,
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {pages[currentPage]}
      </main>
      <Toast
        message={toast}
        isVisible={!!toast}
        onHide={hideToast}
      />
    </div>
  )
}