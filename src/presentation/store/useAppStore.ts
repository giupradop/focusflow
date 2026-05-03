import { create } from 'zustand'

type Page = 'hoje' | 'tasks' | 'lazer' | 'calendario' | 'stats' | 'resumo' | 'arquivo' | 'settings'

type AppStore = {
  currentPage: Page
  setCurrentPage: (page: Page) => void
}

export const useAppStore = create<AppStore>((set) => ({
  currentPage: 'hoje',
  setCurrentPage: (page) => set({ currentPage: page }),
}))