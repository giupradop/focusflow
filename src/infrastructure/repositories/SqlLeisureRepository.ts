import sql from 'mssql'
import { LeisureActivity } from '../../domain/leisure/LeisureActivity'
import { LeisureBank } from '../../domain/leisure/LeisureBank'
import { LeisureSession } from '../../domain/leisure/LeisureSession'
import type { ILeisureRepository, LeisureHistory } from '../../domain/leisure/ILeisureRepository'
import { getPool } from '../http/database'

function weekMonday(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - (d.getDay() + 6) % 7)
  return d.toISOString().split('T')[0]
}

export class SqlLeisureRepository implements ILeisureRepository {

  async findBank(): Promise<LeisureBank> {
    const pool = await getPool()
    const result = await pool.request()
      .query(`SELECT * FROM LeisureBank WHERE id = 1`)
    const row = result.recordset[0]
    const bank = LeisureBank.create(1)
    if (row.balanceMinutes > 0) bank.deposit(row.balanceMinutes)
    return bank
  }

  async saveBank(bank: LeisureBank): Promise<void> {
    const pool = await getPool()
    await pool.request()
      .input('balance', sql.Int, bank.balance.minutes)
      .query(`UPDATE LeisureBank SET balanceMinutes = @balance WHERE id = 1`)
  }

  async findActivities(): Promise<LeisureActivity[]> {
    const pool = await getPool()
    const result = await pool.request()
      .query(`SELECT * FROM LeisureActivity`)
    return result.recordset.map(r =>
      LeisureActivity.create(r.id, r.name, r.costMinutes)
    )
  }

  async findActivityById(id: number): Promise<LeisureActivity | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT * FROM LeisureActivity WHERE id = @id`)
    if (!result.recordset[0]) return null
    const r = result.recordset[0]
    return LeisureActivity.create(r.id, r.name, r.costMinutes)
  }

  async saveActivity(activity: LeisureActivity): Promise<void> {
    const pool = await getPool()
    const existing = activity.id > 0 ? await this.findActivityById(activity.id) : null
    if (existing) {
      await pool.request()
        .input('id', sql.Int, activity.id)
        .input('name', sql.NVarChar, activity.name)
        .input('costMinutes', sql.Int, activity.costMinutes)
        .query(`UPDATE LeisureActivity SET name = @name, costMinutes = @costMinutes WHERE id = @id`)
    } else {
      await pool.request()
        .input('name', sql.NVarChar, activity.name)
        .input('costMinutes', sql.Int, activity.costMinutes)
        .query(`INSERT INTO LeisureActivity (name, costMinutes) VALUES (@name, @costMinutes)`)
    }
  }

  async deleteActivity(id: number): Promise<void> {
    const pool = await getPool()
    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM LeisureActivity WHERE id = @id`)
  }

  async saveSession(session: LeisureSession): Promise<void> {
    const pool = await getPool()
    const existing = session.id > 0 ? await this.findSessionById(session.id) : null
    if (existing) {
      await pool.request()
        .input('id', sql.Int, session.id)
        .input('endedAt', sql.DateTime2, session.endedAt ?? null)
        .input('usedSeconds', sql.Int, session.usedSeconds)
        .query(`UPDATE LeisureSession SET endedAt = @endedAt, usedSeconds = @usedSeconds WHERE id = @id`)
    } else {
      await pool.request()
        .input('activityId', sql.Int, session.activityId)
        .input('activityCostMinutes', sql.Int, session.activityCostMinutes)
        .input('startedAt', sql.DateTime2, session.startedAt)
        .input('endedAt', sql.DateTime2, session.endedAt ?? null)
        .input('usedSeconds', sql.Int, session.usedSeconds)
        .query(`
          INSERT INTO LeisureSession (activityId, activityCostMinutes, startedAt, endedAt, usedSeconds)
          VALUES (@activityId, @activityCostMinutes, @startedAt, @endedAt, @usedSeconds)
        `)
    }
  }

  async findSessionById(id: number): Promise<LeisureSession | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT * FROM LeisureSession WHERE id = @id`)
    if (!result.recordset[0]) return null
    const r = result.recordset[0]
    return LeisureSession.create(r.id, r.activityId, r.activityCostMinutes)
  }

  async findHistory(): Promise<LeisureHistory> {
    const pool = await getPool()

    const configRes = await pool.request().query(`SELECT ratio FROM Config WHERE id = 1`)
    const ratio: number = configRes.recordset[0]?.ratio ?? 5

    const sessionsRes = await pool.request().query(
      `SELECT usedSeconds, endedAt FROM LeisureSession WHERE endedAt IS NOT NULL`
    )
    const tasksRes = await pool.request().query(
      `SELECT spentSeconds, completedAt FROM Task WHERE completedAt IS NOT NULL AND status = 'concluída'`
    )
    const activityRes = await pool.request().query(`
      SELECT la.id, la.name, la.costMinutes, COALESCE(SUM(ls.usedSeconds), 0) AS totalUsedSeconds
      FROM LeisureActivity la
      LEFT JOIN LeisureSession ls ON ls.activityId = la.id AND ls.endedAt IS NOT NULL
      GROUP BY la.id, la.name, la.costMinutes
    `)

    const spentByWeek: Record<string, number> = {}
    for (const r of sessionsRes.recordset) {
      const key = weekMonday(new Date(r.endedAt))
      spentByWeek[key] = (spentByWeek[key] ?? 0) + Math.ceil(r.usedSeconds / 60)
    }

    const earnedByWeek: Record<string, number> = {}
    for (const r of tasksRes.recordset) {
      const key = weekMonday(new Date(r.completedAt))
      earnedByWeek[key] = (earnedByWeek[key] ?? 0) + Math.ceil(r.spentSeconds / 60 / ratio)
    }

    const now = new Date()
    const monday = new Date(now)
    monday.setHours(0, 0, 0, 0)
    monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7)

    const weeklyHistory = []
    for (let i = 0; i < 4; i++) {
      const start = new Date(monday)
      start.setDate(start.getDate() - i * 7)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      const key = start.toISOString().split('T')[0]
      const earned = earnedByWeek[key] ?? 0
      const spent = spentByWeek[key] ?? 0
      if (earned > 0 || spent > 0) {
        weeklyHistory.push({
          weekStart: key,
          weekEnd: end.toISOString().split('T')[0],
          earnedMinutes: earned,
          spentMinutes: spent,
        })
      }
    }

    return {
      weeklyHistory,
      perActivity: activityRes.recordset.map((r: any) => ({
        activityId: r.id,
        name: r.name,
        costMinutes: r.costMinutes,
        totalUsedMinutes: Math.ceil(r.totalUsedSeconds / 60),
      })),
    }
  }
}