import { create } from 'zustand'
import { LeisureActivity } from '../../domain/leisure/LeisureActivity'
import { LeisureSession } from '../../domain/leisure/LeisureSession'
import { LeisureBank } from '../../domain/leisure/LeisureBank'
import { CreateLeisureActivityUseCase } from '../../application/leisure/CreateLeisureActivityUseCase'
import { StartLeisureSessionUseCase } from '../../application/leisure/StartLeisureSessionUseCase'
import { CompleteLeisureSessionUseCase } from '../../application/leisure/CompleteLeisureSessionUseCase'
import { ApiLeisureRepository } from '../../infrastructure/repositories/ApiLeisureRepository'
import type { LeisureHistory } from '../../domain/leisure/ILeisureRepository'

const repository = new ApiLeisureRepository()
const createActivityUseCase = new CreateLeisureActivityUseCase(repository)
const startSessionUseCase = new StartLeisureSessionUseCase(repository)
const completeSessionUseCase = new CompleteLeisureSessionUseCase(repository)

const CONFIG_BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/config`
const HEADERS = { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_API_KEY ?? '' }

type LeisureStore = {
  bank: LeisureBank | null
  activities: LeisureActivity[]
  activeSession: LeisureSession | null
  sessionTick: number
  history: LeisureHistory
  isLoading: boolean
  ratio: number

  loadBank: () => Promise<void>
  loadActivities: () => Promise<void>
  loadHistory: () => Promise<void>
  loadRatio: () => Promise<void>
  createActivity: (name: string, costMinutes: number) => Promise<void>
  deleteActivity: (id: number) => Promise<void>
  startSession: (activityId: number, requestedMinutes?: number) => Promise<void>
  completeSession: (elapsedSeconds?: number) => Promise<void>
  tickSession: () => void
  setRatio: (ratio: number) => Promise<void>
}

export const useLeisureStore = create<LeisureStore>((set, get) => ({
  bank: null,
  activities: [],
  activeSession: null,
  sessionTick: 0,
  history: { weeklyHistory: [], perActivity: [] },
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

  loadHistory: async () => {
    const history = await repository.findHistory()
    set({ history })
  },

  createActivity: async (name, costMinutes) => {
    await createActivityUseCase.execute({ name, costMinutes })
    await get().loadActivities()
  },

  deleteActivity: async (id) => {
    await repository.deleteActivity(id)
    await get().loadActivities()
  },

  startSession: async (activityId, requestedMinutes) => {
    const { session } = await startSessionUseCase.execute({ activityId, requestedMinutes })
    set({ activeSession: session })
  },

  completeSession: async (elapsedSeconds?: number) => {
    const { activeSession } = get()
    if (!activeSession) return
    if (elapsedSeconds !== undefined) activeSession.setUsedSeconds(elapsedSeconds)
    await completeSessionUseCase.execute({ session: activeSession })
    set({ activeSession: null })
    await get().loadBank()
    await get().loadHistory()
  },

  tickSession: () => {
    const { activeSession } = get()
    if (!activeSession) return
    activeSession.tick()
    if (activeSession.isCompleted) {
      get().completeSession()
      return
    }
    set(state => ({ sessionTick: state.sessionTick + 1 }))
  },

  loadRatio: async () => {
    const res = await fetch(CONFIG_BASE, { headers: HEADERS })
    const data = await res.json()
    set({ ratio: data.ratio ?? 5 })
  },

  setRatio: async (ratio) => {
    set({ ratio })
    await fetch(CONFIG_BASE, { method: 'PUT', headers: HEADERS, body: JSON.stringify({ ratio }) })
  },
}))
