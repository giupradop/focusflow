import { LeisureActivity } from '../../domain/leisure/LeisureActivity'
import { LeisureBank } from '../../domain/leisure/LeisureBank'
import { LeisureSession } from '../../domain/leisure/LeisureSession'
import type { ILeisureRepository, LeisureHistory } from '../../domain/leisure/ILeisureRepository'

const BASE = 'http://localhost:3001/api'

export class ApiLeisureRepository implements ILeisureRepository {

  async findBank(): Promise<LeisureBank> {
    const res = await fetch(`${BASE}/leisure/bank`)
    const data = await res.json()
    const bank = LeisureBank.create(1)
    if (data.balanceMinutes > 0) bank.deposit(data.balanceMinutes)
    return bank
  }

  async saveBank(bank: LeisureBank): Promise<void> {
    await fetch(`${BASE}/leisure/bank`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balanceMinutes: bank.balance.minutes }),
    })
  }

  async findActivities(): Promise<LeisureActivity[]> {
    const res = await fetch(`${BASE}/leisure/activities`)
    const data = await res.json()
    return data.map((a: any) => LeisureActivity.create(a.id, a.name, a.costMinutes))
  }

  async findActivityById(id: number): Promise<LeisureActivity | null> {
    const res = await fetch(`${BASE}/leisure/activities/${id}`)
    if (!res.ok) return null
    const a = await res.json()
    return LeisureActivity.create(a.id, a.name, a.costMinutes)
  }

  async saveActivity(activity: LeisureActivity): Promise<void> {
    await fetch(`${BASE}/leisure/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: activity.id, name: activity.name, costMinutes: activity.costMinutes }),
    })
  }

  async deleteActivity(id: number): Promise<void> {
    await fetch(`${BASE}/leisure/activities/${id}`, { method: 'DELETE' })
  }

  async saveSession(session: LeisureSession): Promise<void> {
    await fetch(`${BASE}/leisure/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityId: session.activityId,
        activityCostMinutes: session.activityCostMinutes,
        startedAt: session.startedAt.toISOString(),
        endedAt: session.endedAt?.toISOString() ?? null,
        usedSeconds: session.usedSeconds,
      }),
    })
  }

  async findSessionById(id: number): Promise<LeisureSession | null> {
    const res = await fetch(`${BASE}/leisure/sessions/${id}`)
    if (!res.ok) return null
    const s = await res.json()
    return LeisureSession.create(s.id, s.activityId, s.activityCostMinutes)
  }

  async findHistory(): Promise<LeisureHistory> {
    const res = await fetch(`${BASE}/leisure/history`)
    return res.json()
  }
}