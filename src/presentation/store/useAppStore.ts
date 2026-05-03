import { create } from 'zustand'

type Page = 'hoje' | 'tasks' | 'lazer' | 'calendario' | 'stats' | 'resumo' | 'arquivo' | 'settings'

type AppStore = {
  currentPage: Page
  setCurrentPage: (page: Page) => void
  toast: string
  showToast: (message: string) => void
  hideToast: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  currentPage: 'hoje',
  setCurrentPage: (page) => set({ currentPage: page }),
  toast: '',
  showToast: (message) => set({ toast: message }),
  hideToast: () => set({ toast: '' }),
}))