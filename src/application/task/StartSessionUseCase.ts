import { Session } from '../../domain/task/Session'
import type { ITaskRepository } from '../../domain/task/ITaskRepository'

type StartSessionInput = {
  taskId: number
}

type StartSessionOutput = {
  session: Session
}

export class StartSessionUseCase {
  private taskRepository: ITaskRepository

  constructor(taskRepository: ITaskRepository) {
    this.taskRepository = taskRepository
  }

  async execute(input: StartSessionInput): Promise<StartSessionOutput> {
    const task = await this.taskRepository.findById(input.taskId)

    if (!task) {
      throw new Error(`Task ${input.taskId} não encontrada`)
    }

    const sessionId = 0
    const session = task.startSession(sessionId)

    await this.taskRepository.save(task)

    return { session }
  }
}