import { LeisureSession } from '../../domain/leisure/LeisureSession'
import type { ILeisureRepository } from '../../domain/leisure/ILeisureRepository'

type StartLeisureSessionInput = {
  activityId: number
}

type StartLeisureSessionOutput = {
  session: LeisureSession
}

export class StartLeisureSessionUseCase {
  private leisureRepository: ILeisureRepository

  constructor(leisureRepository: ILeisureRepository) {
    this.leisureRepository = leisureRepository
  }

  async execute(input: StartLeisureSessionInput): Promise<StartLeisureSessionOutput> {
    const activity = await this.leisureRepository.findActivityById(input.activityId)

    if (!activity) {
      throw new Error(`Atividade ${input.activityId} não encontrada`)
    }

    const bank = await this.leisureRepository.findBank()

    if (!bank.canAfford(activity.costMinutes)) {
      throw new Error('Saldo insuficiente no banco de lazer')
    }

    const sessionId = Date.now()
    const session = LeisureSession.create(sessionId, activity.id, activity.costMinutes)

    await this.leisureRepository.saveSession(session)

    return { session }
  }
}