import { LeisureActivity } from './LeisureActivity'
import { LeisureBank } from './LeisureBank'
import { LeisureSession } from './LeisureSession'

export type WeekSummary = {
  weekStart: string
  weekEnd: string
  earnedMinutes: number
  spentMinutes: number
}

export type ActivityStat = {
  activityId: number
  name: string
  costMinutes: number
  totalUsedMinutes: number
}

export type LeisureHistory = {
  weeklyHistory: WeekSummary[]
  perActivity: ActivityStat[]
}

export interface ILeisureRepository {
  findBank(): Promise<LeisureBank>
  saveBank(bank: LeisureBank): Promise<void>
  findActivities(): Promise<LeisureActivity[]>
  findActivityById(id: number): Promise<LeisureActivity | null>
  saveActivity(activity: LeisureActivity): Promise<void>
  deleteActivity(id: number): Promise<void>
  saveSession(session: LeisureSession): Promise<void>
  findSessionById(id: number): Promise<LeisureSession | null>
  findHistory(): Promise<LeisureHistory>
}