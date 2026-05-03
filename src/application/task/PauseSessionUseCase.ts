import { Session } from '../../domain/task/Session'
import type { ITaskRepository } from '../../domain/task/ITaskRepository'

type PauseSessionInput = {
  taskId: number
  session: Session
}

export class PauseSessionUseCase {
  private taskRepository: ITaskRepository

  constructor(taskRepository: ITaskRepository) {
    this.taskRepository = taskRepository
  }

  async execute(input: PauseSessionInput): Promise<void> {
    const task = await this.taskRepository.findById(input.taskId)

    if (!task) {
      throw new Error(`Task ${input.taskId} não encontrada`)
    }

    task.saveSession(input.session)

    await this.taskRepository.save(task)
  }
}