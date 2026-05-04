import { LeisureSession } from '../../domain/leisure/LeisureSession'
import type { ILeisureRepository } from '../../domain/leisure/ILeisureRepository'

type CompleteLeisureSessionInput = {
  session: LeisureSession
}

export class CompleteLeisureSessionUseCase {
  private leisureRepository: ILeisureRepository

  constructor(leisureRepository: ILeisureRepository) {
    this.leisureRepository = leisureRepository
  }

  async execute(input: CompleteLeisureSessionInput): Promise<void> {
    const session = input.session

    if (!session.isCompleted) {
      session.complete()
    }

    const bank = await this.leisureRepository.findBank()

    bank.withdraw(session)

    await this.leisureRepository.saveBank(bank)
    await this.leisureRepository.saveSession(session)
  }
}