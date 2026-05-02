import { Task } from './Task'

export interface ITaskRepository {
  findById(id: number): Promise<Task | null>
  findByWeek(start: Date, end: Date): Promise<Task[]>
  findToday(): Promise<Task[]>
  findArchived(): Promise<Task[]>
  save(task: Task): Promise<void>
  delete(id: number): Promise<void>
}