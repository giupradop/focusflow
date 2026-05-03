import { create } from 'zustand'
import { LeisureActivity } from '../../domain/leisure/LeisureActivity'
import { LeisureSession } from '../../domain/leisure/LeisureSession'
import { LeisureBank } from '../../domain/leisure/LeisureBank'
import { LocalStorageLeisureRepository } from '../../infrastructure/repositories/LocalStorageLeisureRepository'
import { CreateLeisureActivityUseCase } from '../../application/leisure/CreateLeisureActivityUseCase'
import { StartLeisureSessionUseCase } from '../../application/leisure/StartLeisureSessionUseCase'
import { CompleteLeisureSessionUseCase } from '../../application/leisure/CompleteLeisureSessionUseCase'

const repository = new LocalStorageLeisureRepository()
const createActivityUseCase = new CreateLeisureActivityUseCase(repository)
const startSessionUseCase = new StartLeisureSessionUseCase(repository)
const completeSessionUseCase = new CompleteLeisureSessionUseCase(repository)

type LeisureStore = {
  bank: LeisureBank | null
  activities: LeisureActivity[]
  activeSession: LeisureSession | null
  isLoading: boolean
  ratio: number

  loadBank: () => Promise<void>
  loadActivities: () => Promise<void>
  createActivity: (name: string, costMinutes: number) => Promise<void>
  deleteActivity: (id: number) => Promise<void>
  startSession: (activityId: number) => Promise<void>
  completeSession: () => Promise<void>
  tickSession: () => void
  setRatio: (ratio: number) => void
}

export const useLeisureStore = create<LeisureStore>((set, get) => ({
  bank: null,
  activities: [],
  activeSession: null,
  isLoading: false,
  ratio: 5,

  loadBank: async () => {
    const bank = await repository.findBank()
    set({ bank })
  },

  loadActivities: async () => {
    const activities = await repository.findActivities()
    set({ activities })
  },

  createActivity: async (name, costMinutes) => {
    await createActivityUseCase.execute({ name, costMinutes })
    await get().loadActivities()
  },

  deleteActivity: async (id) => {
    await repository.deleteActivity(id)
    await get().loadActivities()
  },

  startSession: async (activityId) => {
    const { session } = await startSessionUseCase.execute({ activityId })
    set({ activeSession: session })
  },

  completeSession: async () => {
    const { activeSession } = get()
    if (!activeSession) return
    await completeSessionUseCase.execute({ session: activeSession })
    set({ activeSession: null })
    await get().loadBank()
  },

  tickSession: () => {
    const { activeSession } = get()
    if (!activeSession) return
    activeSession.tick()
    if (activeSession.isCompleted) {
      get().completeSession()
      return
    }
    set({ activeSession: { ...activeSession } as LeisureSession })
  },

  setRatio: (ratio) => set({ ratio }),
}))