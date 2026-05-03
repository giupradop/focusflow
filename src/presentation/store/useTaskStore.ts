import { create } from 'zustand'
import { Task } from '../../domain/task/Task'
import { LocalStorageTaskRepository } from '../../infrastructure/repositories/LocalStorageTaskRepository'
import { CreateTaskUseCase } from '../../application/task/CreateTaskUseCase'
import { UpdateTaskUseCase } from '../../application/task/UpdateTaskUseCase'
import { ArchiveTaskUseCase } from '../../application/task/ArchiveTaskUseCase'
import { RestoreTaskUseCase } from '../../application/task/RestoreTaskUseCase'
import { GetTasksByWeekUseCase } from '../../application/task/GetTasksByWeekUseCase'
import { GetTodayTasksUseCase } from '../../application/task/GetTodayTasksUseCase'
import { PauseRecurrenceUseCase } from '../../application/task/PauseRecurrenceUseCase'
import { ResumeRecurrenceUseCase } from '../../application/task/ResumeRecurrenceUseCase'
import type { Category } from '../../domain/task/Category'

const repository = new LocalStorageTaskRepository()

const createTaskUseCase = new CreateTaskUseCase(repository)
const updateTaskUseCase = new UpdateTaskUseCase(repository)
const archiveTaskUseCase = new ArchiveTaskUseCase(repository)
const restoreTaskUseCase = new RestoreTaskUseCase(repository)
const getTasksByWeekUseCase = new GetTasksByWeekUseCase(repository)
const getTodayTasksUseCase = new GetTodayTasksUseCase(repository)
const pauseRecurrenceUseCase = new PauseRecurrenceUseCase(repository)
const resumeRecurrenceUseCase = new ResumeRecurrenceUseCase(repository)

type TaskStore = {
  tasks: Task[]
  carriedTasks: Task[]
  todayTasks: Task[]
  overdueTasks: Task[]
  archivedTasks: Task[]
  isLoading: boolean
  weekOffset: number
  curCategory: Category | null

  loadWeek: (offset: number, category?: Category) => Promise<void>
  loadToday: () => Promise<void>
  loadArchived: () => Promise<void>
  createTask: (input: {
    name: string
    category: Category
    priorityLevel: string
    estimatedMinutes: number
    dueDate: Date
    notes: string
    recurrent: boolean
    recurDays: number[]
    createdAt?: Date
  }) => Promise<void>
  updateTask: (input: {
    id: number
    name: string
    category: Category
    priorityLevel: string
    estimatedMinutes: number
    dueDate: Date
    notes: string
    recurrent: boolean
    recurDays: number[]
  }) => Promise<void>
  archiveTask: (id: number) => Promise<void>
  restoreTask: (id: number) => Promise<void>
  pauseRecurrence: (id: number) => Promise<void>
  resumeRecurrence: (id: number) => Promise<void>
  setWeekOffset: (offset: number) => void
  setCurCategory: (category: Category | null) => void
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  carriedTasks: [],
  todayTasks: [],
  overdueTasks: [],
  archivedTasks: [],
  isLoading: false,
  weekOffset: 0,
  curCategory: null,

  loadWeek: async (offset, category) => {
    set({ isLoading: true })
    const { tasks, carriedTasks } = await getTasksByWeekUseCase.execute({
      weekOffset: offset,
      category,
    })
    set({ tasks, carriedTasks, isLoading: false, weekOffset: offset })
  },

  loadToday: async () => {
    set({ isLoading: true })
    const { todayTasks, overdueTasks } = await getTodayTasksUseCase.execute()
    set({ todayTasks, overdueTasks, isLoading: false })
  },

  loadArchived: async () => {
    set({ isLoading: true })
    const archived = await repository.findArchived()
    set({ archivedTasks: archived, isLoading: false })
  },

  createTask: async (input) => {
    await createTaskUseCase.execute(input)
    const { weekOffset, curCategory } = get()
    await get().loadWeek(weekOffset, curCategory ?? undefined)
  },

  updateTask: async (input) => {
    await updateTaskUseCase.execute(input)
    const { weekOffset, curCategory } = get()
    await get().loadWeek(weekOffset, curCategory ?? undefined)
  },

  archiveTask: async (id) => {
    await archiveTaskUseCase.execute({ id })
    const { weekOffset, curCategory } = get()
    await get().loadWeek(weekOffset, curCategory ?? undefined)
  },

  restoreTask: async (id) => {
    await restoreTaskUseCase.execute({ id })
    await get().loadArchived()
  },

  pauseRecurrence: async (id) => {
    await pauseRecurrenceUseCase.execute({ taskId: id })
    const { weekOffset, curCategory } = get()
    await get().loadWeek(weekOffset, curCategory ?? undefined)
  },

  resumeRecurrence: async (id) => {
    await resumeRecurrenceUseCase.execute({ taskId: id })
    await get().loadArchived()
  },

  setWeekOffset: (offset) => set({ weekOffset: offset }),
  setCurCategory: (category) => set({ curCategory: category }),
}))