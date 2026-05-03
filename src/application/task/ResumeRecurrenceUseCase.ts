import type { ITaskRepository } from '../../domain/task/ITaskRepository'

type ResumeRecurrenceInput = {
  taskId: number
}

export class ResumeRecurrenceUseCase {
  private taskRepository: ITaskRepository

  constructor(taskRepository: ITaskRepository) {
    this.taskRepository = taskRepository
  }

  async execute(input: ResumeRecurrenceInput): Promise<void> {
    const task = await this.taskRepository.findById(input.taskId)

    if (!task) {
      throw new Error(`Task ${input.taskId} não encontrada`)
    }

    if (!task.recurrent) {
      throw new Error('Task não é recorrente')
    }

    task.resumeRecurrence()

    await this.taskRepository.save(task)
  }
}