import { LeisureActivity } from './LeisureActivity'
import { LeisureBank } from './LeisureBank'

export interface ILeisureRepository {
  findBank(): Promise<LeisureBank>
  saveBank(bank: LeisureBank): Promise<void>
  findActivities(): Promise<LeisureActivity[]>
  findActivityById(id: number): Promise<LeisureActivity | null>
  saveActivity(activity: LeisureActivity): Promise<void>
  deleteActivity(id: number): Promise<void>
}