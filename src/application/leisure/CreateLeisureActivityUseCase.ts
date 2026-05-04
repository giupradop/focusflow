import { LeisureActivity } from '../../domain/leisure/LeisureActivity'
import type { ILeisureRepository } from '../../domain/leisure/ILeisureRepository'

type CreateLeisureActivityInput = {
  name: string
  costMinutes: number
}

type CreateLeisureActivityOutput = {
  activity: LeisureActivity
}

export class CreateLeisureActivityUseCase {
  private leisureRepository: ILeisureRepository

  constructor(leisureRepository: ILeisureRepository) {
    this.leisureRepository = leisureRepository
  }

  async execute(input: CreateLeisureActivityInput): Promise<CreateLeisureActivityOutput> {
    const id = 0

    const activity = LeisureActivity.create(id, input.name, input.costMinutes)

    await this.leisureRepository.saveActivity(activity)

    return { activity }
  }
}