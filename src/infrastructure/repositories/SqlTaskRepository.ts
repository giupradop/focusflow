import { Task } from '../../domain/task/Task'
import { Priority } from '../../domain/task/Priority'
import type { ITaskRepository } from '../../domain/task/ITaskRepository'
import { getPool } from '../http/database'

export class SqlTaskRepository implements ITaskRepository {

  private deserialize(row: any): Task {
    return Task.restore(row.id, {
      name: row.name,
      category: row.category,
      priority: Priority.create(row.priority),
      status: row.status,
      createdAt: new Date(row.createdat),
      dueDate: new Date(row.duedate),
      estimatedMinutes: row.estimatedminutes,
      notes: row.notes ?? '',
      archived: row.archived,
      recurrent: row.recurrent,
      recurDays: row.recurdays ? row.recurdays.split(',').filter(Boolean).map(Number) : [],
      recurPaused: row.recurpaused,
      sessions: [],
      completedAt: row.completedat ? new Date(row.completedat) : undefined,
      spentSeconds: row.spentseconds ?? 0,
    })
  }

  async findById(id: number): Promise<Task | null> {
    const pool = await getPool()
    const result = await pool.query(`SELECT * FROM task WHERE id = $1`, [id])
    if (!result.rows[0]) return null
    return this.deserialize(result.rows[0])
  }

  async findByWeek(start: Date, end: Date, category?: string): Promise<Task[]> {
    const pool = await getPool()
    if (category) {
      const result = await pool.query(
        `SELECT * FROM task WHERE archived = false AND createdat >= $1 AND createdat <= $2 AND category = $3`,
        [start, end, category]
      )
      return result.rows.map(r => this.deserialize(r))
    }
    const result = await pool.query(
      `SELECT * FROM task WHERE archived = false AND createdat >= $1 AND createdat <= $2`,
      [start, end]
    )
    return result.rows.map(r => this.deserialize(r))
  }

  async findCarriedOver(weekStart: Date, category?: string): Promise<Task[]> {
    const pool = await getPool()
    if (category) {
      const result = await pool.query(
        `SELECT * FROM task WHERE archived = false AND status != 'concluída' AND createdat < $1 AND category = $2`,
        [weekStart, category]
      )
      return result.rows.map(r => this.deserialize(r))
    }
    const result = await pool.query(
      `SELECT * FROM task WHERE archived = false AND status != 'concluída' AND createdat < $1`,
      [weekStart]
    )
    return result.rows.map(r => this.deserialize(r))
  }

  async findToday(): Promise<Task[]> {
    const pool = await getPool()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const result = await pool.query(
      `SELECT * FROM task WHERE archived = false AND status != 'concluída' AND ((createdat >= $1 AND createdat < $2) OR (duedate >= $1 AND duedate < $2))`,
      [today, tomorrow]
    )
    return result.rows.map(r => this.deserialize(r))
  }

  async findOverdue(): Promise<Task[]> {
    const pool = await getPool()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const result = await pool.query(
      `SELECT * FROM task WHERE archived = false AND status != 'concluída' AND status != 'arquivada' AND duedate < $1`,
      [today]
    )
    return result.rows.map(r => this.deserialize(r))
  }

  async findArchived(): Promise<Task[]> {
    const pool = await getPool()
    const result = await pool.query(`SELECT * FROM task WHERE archived = true`)
    return result.rows.map(r => this.deserialize(r))
  }

  async save(task: Task): Promise<void> {
    const pool = await getPool()
    const existing = await this.findById(task.id)

    if (existing) {
      await pool.query(
        `UPDATE task SET
          name = $1, category = $2, priority = $3, status = $4,
          duedate = $5, estimatedminutes = $6, notes = $7, archived = $8,
          recurrent = $9, recurdays = $10, recurpaused = $11,
          completedat = $12, spentseconds = $13
        WHERE id = $14`,
        [
          task.name, task.category, task.priority.toString(), task.status,
          task.dueDate, task.estimatedMinutes, task.notes ?? '', task.archived,
          task.recurrent, task.recurDays.join(','), task.recurPaused,
          task.completedAt ?? null, task.totalSpentSeconds, task.id,
        ]
      )
    } else {
      await pool.query(
        `INSERT INTO task
          (name, category, priority, status, createdat, duedate, estimatedminutes,
           notes, archived, recurrent, recurdays, recurpaused, completedat, spentseconds)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          task.name, task.category, task.priority.toString(), task.status,
          task.createdAt, task.dueDate, task.estimatedMinutes,
          task.notes ?? '', task.archived, task.recurrent,
          task.recurDays.join(','), task.recurPaused,
          task.completedAt ?? null, task.totalSpentSeconds,
        ]
      )
    }
  }

  async delete(id: number): Promise<void> {
    const pool = await getPool()
    await pool.query(`DELETE FROM task WHERE id = $1`, [id])
  }
}
