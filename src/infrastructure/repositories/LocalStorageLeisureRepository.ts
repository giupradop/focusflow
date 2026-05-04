import { LeisureActivity } from '../../domain/leisure/LeisureActivity'
import { LeisureBank } from '../../domain/leisure/LeisureBank'
import { LeisureSession } from '../../domain/leisure/LeisureSession'
import type { ILeisureRepository, LeisureHistory } from '../../domain/leisure/ILeisureRepository'

export class LocalStorageLeisureRepository implements ILeisureRepository {
  private readonly BANK_KEY = 'focusflow:leisureBank'
  private readonly ACTIVITIES_KEY = 'focusflow:leisureActivities'
  private readonly SESSIONS_KEY = 'focusflow:leisureSessions'

  // ── LeisureBank ──

  async findBank(): Promise<LeisureBank> {
    const raw = localStorage.getItem(this.BANK_KEY)
    if (!raw) return LeisureBank.create(1)
    const data = JSON.parse(raw)
    const bank = LeisureBank.create(data.id)
    const minutes = data.balanceMinutes ?? 0
    if (minutes > 0) bank.deposit(minutes)
    return bank
  }

  async saveBank(bank: LeisureBank): Promise<void> {
    const data = {
      id: bank.id,
      balanceMinutes: bank.balance.minutes,
    }
    localStorage.setItem(this.BANK_KEY, JSON.stringify(data))
  }

  // ── LeisureActivity ──

  async findActivities(): Promise<LeisureActivity[]> {
    const raw = localStorage.getItem(this.ACTIVITIES_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return data.map((d: any) =>
      LeisureActivity.create(d.id, d.name, d.costMinutes)
    )
  }

  async findActivityById(id: number): Promise<LeisureActivity | null> {
    const activities = await this.findActivities()
    return activities.find(a => a.id === id) ?? null
  }

  async saveActivity(activity: LeisureActivity): Promise<void> {
    const activities = await this.findActivities()
    const index = activities.findIndex(a => a.id === activity.id)
    if (index >= 0) {
      activities[index] = activity
    } else {
      activities.push(activity)
    }
    const data = activities.map(a => ({
      id: a.id,
      name: a.name,
      costMinutes: a.costMinutes,
    }))
    localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(data))
  }

  async deleteActivity(id: number): Promise<void> {
    const activities = await this.findActivities()
    const filtered = activities.filter(a => a.id !== id)
    const data = filtered.map(a => ({
      id: a.id,
      name: a.name,
      costMinutes: a.costMinutes,
    }))
    localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(data))
  }

  // ── LeisureSession ──

  async saveSession(session: LeisureSession): Promise<void> {
    const sessions = await this.loadSessions()
    const index = sessions.findIndex(s => s.id === session.id)
    if (index >= 0) {
      sessions[index] = session
    } else {
      sessions.push(session)
    }
    const data = sessions.map(s => ({
      id: s.id,
      activityId: s.activityId,
      activityCostMinutes: s.activityCostMinutes,
      startedAt: s.startedAt.toISOString(),
      endedAt: s.endedAt?.toISOString(),
      usedSeconds: s.usedSeconds,
    }))
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(data))
  }

  async findSessionById(id: number): Promise<LeisureSession | null> {
    const sessions = await this.loadSessions()
    return sessions.find(s => s.id === id) ?? null
  }

  async findHistory(): Promise<LeisureHistory> {
    return { weeklyHistory: [], perActivity: [] }
  }

  private async loadSessions(): Promise<LeisureSession[]> {
    const raw = localStorage.getItem(this.SESSIONS_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return data.map((d: any) =>
      LeisureSession.create(d.id, d.activityId, d.activityCostMinutes)
    )
  }
}