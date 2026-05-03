import { Task } from '../../domain/task/Task'
import type { ITaskRepository } from '../../domain/task/ITaskRepository'
import { getWeekRange } from '../../utils/weekHelpers'

type GetTasksByWeekInput = {
  weekOffset: number
  category?: string
}

type GetTasksByWeekOutput = {
  tasks: Task[]
  carriedTasks: Task[]
}

export class GetTasksByWeekUseCase {
  private taskRepository: ITaskRepository

  constructor(taskRepository: ITaskRepository) {
    this.taskRepository = taskRepository
  }

  async execute(input: GetTasksByWeekInput): Promise<GetTasksByWeekOutput> {
    const { start, end } = getWeekRange(input.weekOffset)

    const [tasks, carriedTasks] = await Promise.all([
      this.taskRepository.findByWeek(start, end, input.category),
      input.weekOffset === 0
        ? this.taskRepository.findCarriedOver(start, input.category)
        : Promise.resolve([]),
    ])

    return { tasks, carriedTasks }
  }
}