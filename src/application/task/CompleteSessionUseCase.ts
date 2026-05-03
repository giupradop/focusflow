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
  private taskRepo: ITaskRepository
  private leisureRepo: ILeisureRepository
  private leisureService: LeisureDomainService

  constructor(
    taskRepository: ITaskRepository,
    leisureRepository: ILeisureRepository,
  ) {
    this.taskRepo = taskRepository
    this.leisureRepo = leisureRepository
    this.leisureService = new LeisureDomainService()
  }

  async execute(input: CompleteSessionInput): Promise<CompleteSessionOutput> {
    console.log('CompleteSessionUseCase executando...', input.taskId)

    const task = await this.taskRepo.findById(input.taskId)
    console.log('task encontrada:', task?.name, 'status:', task?.status)

    if (!task) {
      throw new Error(`Task ${input.taskId} não encontrada`)
    }

    task.completeSession(input.session)
    console.log('após completeSession, status:', task.status)

    const bank = await this.leisureRepo.findBank()
    this.leisureService.depositEarned(input.session, bank, input.ratio)

    await this.taskRepo.save(task)
    console.log('task salva!')
    await this.leisureRepo.saveBank(bank)

    return { earnedMinutes: this.leisureService.calculateEarned(input.session, input.ratio) }
  }
}