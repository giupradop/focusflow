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
    const result = await pool.query(`SELECT * FROM leisurebank WHERE id = 1`)
    const row = result.rows[0]
    const bank = LeisureBank.create(1)
    if (row.balanceminutes > 0) bank.deposit(row.balanceminutes)
    return bank
  }

  async saveBank(bank: LeisureBank): Promise<void> {
    const pool = await getPool()
    await pool.query(
      `UPDATE leisurebank SET balanceminutes = $1 WHERE id = 1`,
      [bank.balance.minutes]
    )
  }

  async findActivities(): Promise<LeisureActivity[]> {
    const pool = await getPool()
    const result = await pool.query(`SELECT * FROM leisureactivity`)
    return result.rows.map(r => LeisureActivity.create(r.id, r.name, r.costminutes))
  }

  async findActivityById(id: number): Promise<LeisureActivity | null> {
    const pool = await getPool()
    const result = await pool.query(`SELECT * FROM leisureactivity WHERE id = $1`, [id])
    if (!result.rows[0]) return null
    const r = result.rows[0]
    return LeisureActivity.create(r.id, r.name, r.costminutes)
  }

  async saveActivity(activity: LeisureActivity): Promise<void> {
    const pool = await getPool()
    const existing = activity.id > 0 ? await this.findActivityById(activity.id) : null
    if (existing) {
      await pool.query(
        `UPDATE leisureactivity SET name = $1, costminutes = $2 WHERE id = $3`,
        [activity.name, activity.costMinutes, activity.id]
      )
    } else {
      await pool.query(
        `INSERT INTO leisureactivity (name, costminutes) VALUES ($1, $2)`,
        [activity.name, activity.costMinutes]
      )
    }
  }

  async deleteActivity(id: number): Promise<void> {
    const pool = await getPool()
    await pool.query(`DELETE FROM leisureactivity WHERE id = $1`, [id])
  }

  async saveSession(session: LeisureSession): Promise<void> {
    const pool = await getPool()
    const existing = session.id > 0 ? await this.findSessionById(session.id) : null
    if (existing) {
      await pool.query(
        `UPDATE leisuresession SET endedat = $1, usedseconds = $2 WHERE id = $3`,
        [session.endedAt ?? null, session.usedSeconds, session.id]
      )
    } else {
      await pool.query(
        `INSERT INTO leisuresession (activityid, activitycostminutes, startedat, endedat, usedseconds)
         VALUES ($1, $2, $3, $4, $5)`,
        [session.activityId, session.activityCostMinutes, session.startedAt, session.endedAt ?? null, session.usedSeconds]
      )
    }
  }

  async findSessionById(id: number): Promise<LeisureSession | null> {
    const pool = await getPool()
    const result = await pool.query(`SELECT * FROM leisuresession WHERE id = $1`, [id])
    if (!result.rows[0]) return null
    const r = result.rows[0]
    return LeisureSession.restore(r.id, r.activityid, r.activitycostminutes, r.usedseconds, new Date(r.startedat), r.endedat ? new Date(r.endedat) : undefined)
  }

  async findHistory(): Promise<LeisureHistory> {
    const pool = await getPool()

    const configRes = await pool.query(`SELECT ratio FROM config WHERE id = 1`)
    const ratio: number = configRes.rows[0]?.ratio ?? 5

    const sessionsRes = await pool.query(
      `SELECT usedseconds, endedat FROM leisuresession WHERE endedat IS NOT NULL`
    )
    const tasksRes = await pool.query(
      `SELECT spentseconds, completedat FROM task WHERE completedat IS NOT NULL AND status = 'concluída'`
    )
    const activityRes = await pool.query(`
      SELECT la.id, la.name, la.costminutes, COALESCE(SUM(ls.usedseconds), 0) AS totalusedseconds
      FROM leisureactivity la
      LEFT JOIN leisuresession ls ON ls.activityid = la.id AND ls.endedat IS NOT NULL
      GROUP BY la.id, la.name, la.costminutes
    `)

    const spentByWeek: Record<string, number> = {}
    for (const r of sessionsRes.rows) {
      const key = weekMonday(new Date(r.endedat))
      spentByWeek[key] = (spentByWeek[key] ?? 0) + Math.ceil(r.usedseconds / 60)
    }

    const earnedByWeek: Record<string, number> = {}
    for (const r of tasksRes.rows) {
      const key = weekMonday(new Date(r.completedat))
      earnedByWeek[key] = (earnedByWeek[key] ?? 0) + Math.ceil(r.spentseconds / 60 / ratio)
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
      perActivity: activityRes.rows.map((r: any) => ({
        activityId: r.id,
        name: r.name,
        costMinutes: r.costminutes,
        totalUsedMinutes: Math.ceil(Number(r.totalusedseconds) / 60),
      })),
    }
  }
}
