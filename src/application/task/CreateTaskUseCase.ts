import { Task } from '../../domain/task/Task'
import { Priority } from '../../domain/task/Priority'
import type { Category } from '../../domain/task/Category'
import type { ITaskRepository } from '../../domain/task/ITaskRepository'

type CreateTaskInput = {
  name: string
  category: Category
  priorityLevel: string
  estimatedMinutes: number
  dueDate: Date
  notes: string
  recurrent: boolean
  recurDays: number[]
  createdAt?: Date
}

type CreateTaskOutput = {
  task: Task
}

export class CreateTaskUseCase {
  private taskRepository: ITaskRepository

  constructor(taskRepository: ITaskRepository) {
    this.taskRepository = taskRepository
  }

  async execute(input: CreateTaskInput): Promise<CreateTaskOutput> {
    const priority = Priority.create(input.priorityLevel)

    const id = 0

    const task = Task.create(id, {
      name: input.name,
      category: input.category,
      priority,
      estimatedMinutes: input.estimatedMinutes,
      dueDate: input.dueDate,
      notes: input.notes,
      recurrent: input.recurrent,
      recurDays: input.recurDays,
      createdAt: input.createdAt ?? new Date(),
      recurPaused: false,
    })

    await this.taskRepository.save(task)

    return { task }
  }
}