import { Task } from '../../domain/task/Task'
import { Priority } from '../../domain/task/Priority'
import type { Category } from '../../domain/task/Category'
import type { ITaskRepository } from '../../domain/task/ITaskRepository'

type UpdateTaskInput = {
  id: number
  name: string
  category: Category
  priorityLevel: string
  estimatedMinutes: number
  dueDate: Date
  notes: string
  recurrent: boolean
  recurDays: number[]
}

type UpdateTaskOutput = {
  task: Task
}

export class UpdateTaskUseCase {
  private taskRepository: ITaskRepository

  constructor(taskRepository: ITaskRepository) {
    this.taskRepository = taskRepository
  }

  async execute(input: UpdateTaskInput): Promise<UpdateTaskOutput> {
    const task = await this.taskRepository.findById(input.id)

    if (!task) {
      throw new Error(`Task ${input.id} não encontrada`)
    }

    task.update({
      name: input.name,
      category: input.category,
      priority: Priority.create(input.priorityLevel),
      estimatedMinutes: input.estimatedMinutes,
      dueDate: input.dueDate,
      notes: input.notes,
      recurrent: input.recurrent,
      recurDays: input.recurDays,
    })

    await this.taskRepository.save(task)

    return { task }
  }
}