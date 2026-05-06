import { Session } from '../../domain/task/Session'
import type { ITaskRepository } from '../../domain/task/ITaskRepository'
import type { ILeisureRepository } from '../../domain/leisure/ILeisureRepository'
import { LeisureDomainService } from '../../domain/leisure/LeisureDomainService'

type PauseSessionInput = {
  taskId: number
  session: Session
  ratio: number
}

export class PauseSessionUseCase {
  private taskRepository: ITaskRepository
  private leisureRepository: ILeisureRepository
  private leisureService: LeisureDomainService

  constructor(taskRepository: ITaskRepository, leisureRepository: ILeisureRepository) {
    this.taskRepository = taskRepository
    this.leisureRepository = leisureRepository
    this.leisureService = new LeisureDomainService()
  }

  async execute(input: PauseSessionInput): Promise<void> {
    const task = await this.taskRepository.findById(input.taskId)
    if (!task) throw new Error(`Task ${input.taskId} não encontrada`)

    task.saveSession(input.session)
    await this.taskRepository.save(task)

    const bank = await this.leisureRepository.findBank()
    this.leisureService.depositEarned(input.session, bank, input.ratio)
    await this.leisureRepository.saveBank(bank)
  }
}