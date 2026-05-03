import { Session } from '../../domain/task/Session'
import type { ITaskRepository } from '../../domain/task/ITaskRepository'
import type { ILeisureRepository } from '../../domain/leisure/ILeisureRepository'
import { LeisureDomainService } from '../../domain/leisure/LeisureDomainService'

type CompleteSessionInput = {
  taskId: number
  session: Session
  ratio: number
}

type CompleteSessionOutput = {
  earnedMinutes: number
}

export class CompleteSessionUseCase {
  private taskRepository: ITaskRepository
  private leisureRepository: ILeisureRepository
  private leisureService: LeisureDomainService

  constructor(
    taskRepository: ITaskRepository,
    leisureRepository: ILeisureRepository,
  ) {
    this.taskRepository = taskRepository
    this.leisureRepository = leisureRepository
    this.leisureService = new LeisureDomainService()
  }

  async execute(input: CompleteSessionInput): Promise<CompleteSessionOutput> {
    const task = await this.taskRepository.findById(input.taskId)

    if (!task) {
      throw new Error(`Task ${input.taskId} não encontrada`)
    }

    task.completeSession(input.session)

    const bank = await this.leisureRepository.findBank()
    this.leisureService.depositEarned(input.session, bank, input.ratio)

    await this.taskRepository.save(task)
    await this.leisureRepository.saveBank(bank)

    return { earnedMinutes: this.leisureService.calculateEarned(input.session, input.ratio) }
  }
}