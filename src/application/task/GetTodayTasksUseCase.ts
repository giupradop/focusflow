import { Task } from '../../domain/task/Task'
import type { ITaskRepository } from '../../domain/task/ITaskRepository'

type GetTodayTasksOutput = {
  todayTasks: Task[]
  overdueTasks: Task[]
}

export class GetTodayTasksUseCase {
  private taskRepository: ITaskRepository

  constructor(taskRepository: ITaskRepository) {
    this.taskRepository = taskRepository
  }

  async execute(): Promise<GetTodayTasksOutput> {
    const [todayTasks, overdueTasks] = await Promise.all([
      this.taskRepository.findToday(),
      this.taskRepository.findOverdue(),
    ])

    return { todayTasks, overdueTasks }
  }
}