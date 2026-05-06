import { Router } from 'express'
import { SqlLeisureRepository } from '../../repositories/SqlLeisureRepository'
import { SqlTaskRepository } from '../../repositories/SqlTaskRepository'
import { LeisureBank } from '../../../domain/leisure/LeisureBank'
import { LeisureSession } from '../../../domain/leisure/LeisureSession'
import { CreateLeisureActivityUseCase } from '../../../application/leisure/CreateLeisureActivityUseCase'
import { StartLeisureSessionUseCase } from '../../../application/leisure/StartLeisureSessionUseCase'
import { CompleteLeisureSessionUseCase } from '../../../application/leisure/CompleteLeisureSessionUseCase'
import { CompleteSessionUseCase } from '../../../application/task/CompleteSessionUseCase'
import { PauseSessionUseCase } from '../../../application/task/PauseSessionUseCase'
import { StartSessionUseCase } from '../../../application/task/StartSessionUseCase'
import { Session } from '../../../domain/task/Session'

export const leisureRoutes = Router()

function repo() {
  return new SqlLeisureRepository()
}

// ── history ──

leisureRoutes.get('/history', async (_req, res) => {
  try {
    const history = await repo().findHistory()
    res.json(history)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// ── bank ──

leisureRoutes.get('/bank', async (_req, res) => {
  try {
    const bank = await repo().findBank()
    res.json({ balanceMinutes: bank.balance.minutes })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

leisureRoutes.put('/bank', async (req, res) => {
  try {
    const bank = LeisureBank.create(1)
    const minutes = Number(req.body.balanceMinutes)
    if (minutes > 0) bank.deposit(minutes)
    await repo().saveBank(bank)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// ── activities ──

leisureRoutes.get('/activities', async (_req, res) => {
  try {
    const activities = await repo().findActivities()
    res.json(activities.map(a => ({ id: a.id, name: a.name, costMinutes: a.costMinutes })))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

leisureRoutes.get('/activities/:id', async (req, res) => {
  try {
    const activity = await repo().findActivityById(Number(req.params.id))
    if (!activity) return res.status(404).json({ error: 'atividade não encontrada' })
    res.json({ id: activity.id, name: activity.name, costMinutes: activity.costMinutes })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

leisureRoutes.post('/activities', async (req, res) => {
  try {
    const useCase = new CreateLeisureActivityUseCase(repo())
    const result = await useCase.execute({
      name: req.body.name,
      costMinutes: req.body.costMinutes,
    })
    res.json({ id: result.activity.id, name: result.activity.name, costMinutes: result.activity.costMinutes })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

leisureRoutes.delete('/activities/:id', async (req, res) => {
  try {
    await repo().deleteActivity(Number(req.params.id))
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// ── leisure sessions ──

leisureRoutes.post('/sessions', async (req, res) => {
  try {
    const { activityId, activityCostMinutes, usedSeconds, startedAt, endedAt } = req.body
    const session = LeisureSession.restore(
      0,
      Number(activityId),
      Number(activityCostMinutes),
      Number(usedSeconds ?? 0),
      startedAt ? new Date(startedAt) : new Date(),
      endedAt ? new Date(endedAt) : undefined,
    )
    await repo().saveSession(session)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

leisureRoutes.post('/sessions/start', async (req, res) => {
  try {
    const useCase = new StartLeisureSessionUseCase(repo())
    const result = await useCase.execute({ activityId: Number(req.body.activityId) })
    res.json({
      id: result.session.id,
      activityId: result.session.activityId,
      activityCostMinutes: result.session.activityCostMinutes,
      startedAt: result.session.startedAt.toISOString(),
      usedSeconds: result.session.usedSeconds,
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

leisureRoutes.post('/sessions/:id/complete', async (req, res) => {
  try {
    const leisureRepo = repo()
    const session = await leisureRepo.findSessionById(Number(req.params.id))
    if (!session) return res.status(404).json({ error: 'sessão não encontrada' })
    const useCase = new CompleteLeisureSessionUseCase(leisureRepo)
    await useCase.execute({ session })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// ── task sessions (foco) ──

leisureRoutes.post('/focus/start', async (req, res) => {
  try {
    const useCase = new StartSessionUseCase(new SqlTaskRepository())
    const result = await useCase.execute({ taskId: Number(req.body.taskId) })
    res.json({
      id: result.session.id,
      taskId: result.session.taskId,
      startedAt: result.session.startedAt.toISOString(),
      durationSeconds: result.session.durationSeconds,
      pausedSeconds: result.session.pausedSeconds,
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

leisureRoutes.post('/focus/complete', async (req, res) => {
  try {
    const { taskId, sessionId, durationSeconds, ratio } = req.body
    const session = Session.create(sessionId, taskId)
    for (let i = 0; i < durationSeconds; i++) session.tick()
    const useCase = new CompleteSessionUseCase(new SqlTaskRepository(), repo())
    const result = await useCase.execute({ taskId, session, ratio })
    res.json({ earnedMinutes: result.earnedMinutes })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

leisureRoutes.post('/focus/pause', async (req, res) => {
  try {
    const { taskId, sessionId, durationSeconds, ratio } = req.body
    const session = Session.create(sessionId, taskId)
    session.setDuration(durationSeconds)
    const useCase = new PauseSessionUseCase(new SqlTaskRepository(), new SqlLeisureRepository())
    await useCase.execute({ taskId, session, ratio: ratio ?? 5 })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})