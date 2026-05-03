import type { ITaskRepository } from '../../domain/task/ITaskRepository'

type RestoreTaskInput = {
  id: number
}

export class RestoreTaskUseCase {
  private taskRepository: ITaskRepository

  constructor(taskRepository: ITaskRepository) {
    this.taskRepository = taskRepository
  }

  async execute(input: RestoreTaskInput): Promise<void> {
    const task = await this.taskRepository.findById(input.id)

    if (!task) {
      throw new Error(`Task ${input.id} não encontrada`)
    }

    task.restore()

    await this.taskRepository.save(task)
  }
}