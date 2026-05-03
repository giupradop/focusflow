import type { ITaskRepository } from '../../domain/task/ITaskRepository'

type PauseRecurrenceInput = {
  taskId: number
}

export class PauseRecurrenceUseCase {
  private taskRepository: ITaskRepository

  constructor(taskRepository: ITaskRepository) {
    this.taskRepository = taskRepository
  }

  async execute(input: PauseRecurrenceInput): Promise<void> {
    const task = await this.taskRepository.findById(input.taskId)

    if (!task) {
      throw new Error(`Task ${input.taskId} não encontrada`)
    }

    if (!task.recurrent) {
      throw new Error('Task não é recorrente')
    }

    task.pauseRecurrence()

    await this.taskRepository.save(task)
  }
}