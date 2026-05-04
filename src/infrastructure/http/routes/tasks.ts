import { Router } from 'express'
import { Task } from '../../../domain/task/Task'
import { Priority } from '../../../domain/task/Priority'
import { SqlTaskRepository } from '../../repositories/SqlTaskRepository'
import { CreateTaskUseCase } from '../../../application/task/CreateTaskUseCase'
import { ArchiveTaskUseCase } from '../../../application/task/ArchiveTaskUseCase'
import { RestoreTaskUseCase } from '../../../application/task/RestoreTaskUseCase'
import { GetTasksByWeekUseCase } from '../../../application/task/GetTasksByWeekUseCase'
import { GetTodayTasksUseCase } from '../../../application/task/GetTodayTasksUseCase'
import { PauseRecurrenceUseCase } from '../../../application/task/PauseRecurrenceUseCase'
import { ResumeRecurrenceUseCase } from '../../../application/task/ResumeRecurrenceUseCase'

export const taskRoutes = Router()

function repo() {
  return new SqlTaskRepository()
}

taskRoutes.get('/week', async (req, res) => {
  try {
    const { weekOffset, category } = req.query
    const useCase = new GetTasksByWeekUseCase(repo())
    const result = await useCase.execute({
      weekOffset: Number(weekOffset ?? 0),
      category: category as string | undefined,
    })
    res.json({
      tasks: result.tasks.map(t => serialize(t)),
      carriedTasks: result.carriedTasks.map(t => serialize(t)),
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

taskRoutes.get('/today', async (_req, res) => {
  try {
    const useCase = new GetTodayTasksUseCase(repo())
    const result = await useCase.execute()
    res.json({
      todayTasks: result.todayTasks.map(t => serialize(t)),
      overdueTasks: result.overdueTasks.map(t => serialize(t)),
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

taskRoutes.get('/archived', async (_req, res) => {
  try {
    const tasks = await repo().findArchived()
    res.json(tasks.map(t => serialize(t)))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

taskRoutes.get('/:id', async (req, res) => {
  try {
    const task = await new SqlTaskRepository().findById(Number(req.params.id))
    if (!task) return res.status(404).json({ error: 'não encontrada' })
    res.json(serialize(task))
  } catch (err) {
    console.error('erro GET /tasks/:id:', err)
    res.status(500).json({ error: String(err) })
  }
})

taskRoutes.post('/', async (req, res) => {
  try {
    const useCase = new CreateTaskUseCase(repo())
    const result = await useCase.execute({
      name: req.body.name,
      category: req.body.category,
      priorityLevel: req.body.priority,
      estimatedMinutes: req.body.estimatedMinutes,
      dueDate: new Date(req.body.dueDate),
      notes: req.body.notes ?? '',
      recurrent: req.body.recurrent ?? false,
      recurDays: req.body.recurDays ?? [],
      createdAt: req.body.createdAt ? new Date(req.body.createdAt) : undefined,
    })
    res.json(serialize(result.task))
  } catch (err) {
    console.error('erro POST /tasks:', err)
    res.status(500).json({ error: String(err) })
  }
})

taskRoutes.put('/:id', async (req, res) => {
  try {
    const repository = repo()
    const existing = await repository.findById(Number(req.params.id))
    if (!existing) return res.status(404).json({ error: 'não encontrada' })
    const task = Task.restore(existing.id, {
      name: req.body.name,
      category: req.body.category,
      priority: Priority.create(req.body.priority),
      status: req.body.status,
      createdAt: new Date(req.body.createdAt),
      dueDate: new Date(req.body.dueDate),
      estimatedMinutes: req.body.estimatedMinutes,
      notes: req.body.notes ?? '',
      archived: req.body.archived ?? false,
      recurrent: req.body.recurrent ?? false,
      recurDays: req.body.recurDays ?? [],
      recurPaused: req.body.recurPaused ?? false,
      sessions: [],
      completedAt: req.body.completedAt ? new Date(req.body.completedAt) : undefined,
      spentSeconds: req.body.spentSeconds ?? 0,
    })
    await repository.save(task)
    res.json(serialize(task))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

taskRoutes.post('/:id/archive', async (req, res) => {
  try {
    const useCase = new ArchiveTaskUseCase(repo())
    await useCase.execute({ id: Number(req.params.id) })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

taskRoutes.post('/:id/restore', async (req, res) => {
  try {
    const useCase = new RestoreTaskUseCase(repo())
    await useCase.execute({ id: Number(req.params.id) })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

taskRoutes.post('/:id/pause-recurrence', async (req, res) => {
  try {
    const useCase = new PauseRecurrenceUseCase(repo())
    await useCase.execute({ taskId: Number(req.params.id) })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

taskRoutes.post('/:id/resume-recurrence', async (req, res) => {
  try {
    const useCase = new ResumeRecurrenceUseCase(repo())
    await useCase.execute({ taskId: Number(req.params.id) })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

function serialize(task: any) {
  return {
    id: task.id,
    name: task.name,
    category: task.category,
    priority: task.priority.toString(),
    status: task.status,
    createdAt: task.createdAt.toISOString(),
    dueDate: task.dueDate.toISOString(),
    estimatedMinutes: task.estimatedMinutes,
    notes: task.notes,
    archived: task.archived,
    recurrent: task.recurrent,
    recurDays: task.recurDays,
    recurPaused: task.recurPaused,
    completedAt: task.completedAt?.toISOString() ?? null,
    spentSeconds: task.totalSpentSeconds,
  }
}