import { Task } from '../../domain/task/Task'
import { Priority } from '../../domain/task/Priority'
import type { ITaskRepository } from '../../domain/task/ITaskRepository'

const BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api`
const HEADERS = { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_API_KEY ?? '' }

function deserialize(data: any): Task {
  return Task.restore(data.id, {
    name: data.name,
    category: data.category,
    priority: Priority.create(data.priority),
    status: data.status,
    createdAt: new Date(data.createdAt),
    dueDate: new Date(data.dueDate),
    estimatedMinutes: data.estimatedMinutes,
    notes: data.notes ?? '',
    archived: data.archived,
    recurrent: data.recurrent,
    recurDays: data.recurDays ?? [],
    recurPaused: data.recurPaused,
    sessions: [],
    completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    spentSeconds: data.spentSeconds ?? 0,
  })
}

export class ApiTaskRepository implements ITaskRepository {

  async findById(id: number): Promise<Task | null> {
    const res = await fetch(`${BASE}/tasks/${id}`, { headers: HEADERS })
    if (!res.ok) return null
    return deserialize(await res.json())
  }

  async findByWeek(start: Date, end: Date, category?: string): Promise<Task[]> {
    const params = new URLSearchParams({ start: start.toISOString(), end: end.toISOString() })
    if (category) params.set('category', category)
    const res = await fetch(`${BASE}/tasks/week?${params}`, { headers: HEADERS })
    const data = await res.json()
    return data.tasks.map(deserialize)
  }

  async findCarriedOver(weekStart: Date, category?: string): Promise<Task[]> {
    const params = new URLSearchParams({ start: weekStart.toISOString(), end: weekStart.toISOString() })
    if (category) params.set('category', category)
    const res = await fetch(`${BASE}/tasks/week?${params}`, { headers: HEADERS })
    const data = await res.json()
    return data.carriedTasks.map(deserialize)
  }

  async findToday(): Promise<Task[]> {
    const res = await fetch(`${BASE}/tasks/today`, { headers: HEADERS })
    const data = await res.json()
    return data.todayTasks.map(deserialize)
  }

  async findOverdue(): Promise<Task[]> {
    const res = await fetch(`${BASE}/tasks/today`, { headers: HEADERS })
    const data = await res.json()
    return data.overdueTasks.map(deserialize)
  }

  async findArchived(): Promise<Task[]> {
    const res = await fetch(`${BASE}/tasks/archived`, { headers: HEADERS })
    const data = await res.json()
    return data.map(deserialize)
  }

  async save(task: Task): Promise<void> {
    const body = {
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
      completedAt: task.completedAt?.toISOString() ?? null,
      spentSeconds: task.totalSpentSeconds,
    }

    let existing = null
    try { existing = await this.findById(task.id) } catch { existing = null }

    if (existing) {
      await fetch(`${BASE}/tasks/${task.id}`, { method: 'PUT', headers: HEADERS, body: JSON.stringify(body) })
    } else {
      await fetch(`${BASE}/tasks`, { method: 'POST', headers: HEADERS, body: JSON.stringify(body) })
    }
  }

  async delete(id: number): Promise<void> {
    await fetch(`${BASE}/tasks/${id}`, { method: 'DELETE', headers: HEADERS })
  }
}
