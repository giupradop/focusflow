import { create } from 'zustand'

type Page = 'hoje' | 'tasks' | 'lazer' | 'calendario' | 'stats' | 'resumo' | 'arquivo' | 'settings'

type AppStore = {
  currentPage: Page
  setCurrentPage: (page: Page) => void
  curCategory: string | null
  setCurCategory: (cat: string | null) => void
  toast: string
  showToast: (message: string) => void
  hideToast: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  currentPage: 'hoje',
  setCurrentPage: (page) => set({ currentPage: page }),
  curCategory: null,
  setCurCategory: (cat) => set({ curCategory: cat }),
  toast: '',
  showToast: (message) => set({ toast: message }),
  hideToast: () => set({ toast: '' }),
}))