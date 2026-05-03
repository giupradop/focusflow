import { Task } from '../../domain/task/Task'
import { Priority } from '../../domain/task/Priority'
import type { ITaskRepository } from '../../domain/task/ITaskRepository'

export class LocalStorageTaskRepository implements ITaskRepository {
  private readonly KEY = 'focusflow:tasks'

  private serialize(task: Task): object {
    return {
      id: task.id,
      name: task.name,
      category: task.category,
      priority: task.priority.toString(),
      status: task.status,
      createdAt: task.createdAt.toISOString(),
      dueDate: task.dueDate.toISOString(),
      estimatedMinutes: task.estimatedMinutes,
      notes: task.notes,
      archived: task.archived,
      recurrent: task.recurrent,
      recurDays: task.recurDays,
      recurPaused: task.recurPaused,
      completedAt: task.completedAt?.toISOString(),
      spentSeconds: task.totalSpentSeconds,
    }
  }

  private deserialize(data: any): Task {
    return Task.restore(data.id, {
      name: data.name,
      category: data.category,
      priority: Priority.create(data.priority),
      status: data.status,
      createdAt: new Date(data.createdAt),
      dueDate: new Date(data.dueDate),
      estimatedMinutes: data.estimatedMinutes,
      notes: data.notes,
      archived: data.archived ?? false,
      recurrent: data.recurrent ?? false,
      recurDays: data.recurDays ?? [],
      recurPaused: data.recurPaused ?? false,
      sessions: [],
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      spentSeconds: data.spentSeconds ?? 0,
    })
  }

  private load(): Task[] {
    const raw = localStorage.getItem(this.KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return data.map((d: any) => this.deserialize(d))
  }

  private persist(tasks: Task[]): void {
    const data = tasks.map(t => this.serialize(t))
    localStorage.setItem(this.KEY, JSON.stringify(data))
  }

  async findById(id: number): Promise<Task | null> {
    const tasks = this.load()
    return tasks.find(t => t.id === id) ?? null
  }

  async findByWeek(start: Date, end: Date, category?: string): Promise<Task[]> {
    const tasks = this.load()
    return tasks.filter(t => {
      if (t.archived) return false
      if (category && t.category !== category) return false
      return t.createdAt >= start && t.createdAt <= end
    })
  }

  async findCarriedOver(weekStart: Date, category?: string): Promise<Task[]> {
    const tasks = this.load()
    return tasks.filter(t => {
      if (category && t.category !== category) return false
      return t.isCarriedOver(weekStart)
    })
  }

  async findToday(): Promise<Task[]> {
    const tasks = this.load()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tasks.filter(t => {
      if (t.archived) return false
      if (t.status === 'concluída') return false
      const createdToday = t.createdAt >= today && t.createdAt < tomorrow
      const dueToday = t.dueDate >= today && t.dueDate < tomorrow
      return createdToday || dueToday
    })
  }

  async findOverdue(): Promise<Task[]> {
    const tasks = this.load()
    return tasks.filter(t => t.isOverdue)
  }

  async findArchived(): Promise<Task[]> {
    const tasks = this.load()
    return tasks.filter(t => t.archived)
  }

  async save(task: Task): Promise<void> {
    const tasks = this.load()
    const index = tasks.findIndex(t => t.id === task.id)
    if (index >= 0) {
      tasks[index] = task
    } else {
      tasks.push(task)
    }
    this.persist(tasks)
  }

  async delete(id: number): Promise<void> {
    const tasks = this.load()
    const filtered = tasks.filter(t => t.id !== id)
    this.persist(filtered)
  }
}