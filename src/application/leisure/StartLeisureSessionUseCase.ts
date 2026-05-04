import { LeisureSession } from '../../domain/leisure/LeisureSession'
import type { ILeisureRepository } from '../../domain/leisure/ILeisureRepository'

type StartLeisureSessionInput = {
  activityId: number
  requestedMinutes?: number
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

    const minutes = input.requestedMinutes && input.requestedMinutes > 0
      ? input.requestedMinutes
      : activity.costMinutes

    const bank = await this.leisureRepository.findBank()

    if (!bank.canAfford(minutes)) {
      throw new Error('Saldo insuficiente no banco de lazer')
    }

    const session = LeisureSession.create(0, activity.id, minutes)

    return { session }
  }
}