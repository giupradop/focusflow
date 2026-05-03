import type { ITaskRepository } from '../../domain/task/ITaskRepository'

type ArchiveTaskInput = {
  id: number
}

export class ArchiveTaskUseCase {
  private taskRepository: ITaskRepository

  constructor(taskRepository: ITaskRepository) {
    this.taskRepository = taskRepository
  }

  async execute(input: ArchiveTaskInput): Promise<void> {
    const task = await this.taskRepository.findById(input.id)

    if (!task) {
      throw new Error(`Task ${input.id} não encontrada`)
    }

    task.archive()

    await this.taskRepository.save(task)
  }
}