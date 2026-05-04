import sql from 'mssql'
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
      createdAt: new Date(row.createdAt),
      dueDate: new Date(row.dueDate),
      estimatedMinutes: row.estimatedMinutes,
      notes: row.notes ?? '',
      archived: row.archived,
      recurrent: row.recurrent,
      recurDays: row.recurDays ? row.recurDays.split(',').filter(Boolean).map(Number) : [],
      recurPaused: row.recurPaused,
      sessions: [],
      completedAt: row.completedAt ? new Date(row.completedAt) : undefined,
      spentSeconds: row.spentSeconds ?? 0,
    })
  }

  private async serialize(task: Task, request: sql.Request): Promise<void> {
    request
      .input('name', sql.NVarChar, task.name)
      .input('category', sql.NVarChar, task.category)
      .input('priority', sql.NVarChar, task.priority.toString())
      .input('status', sql.NVarChar, task.status)
      .input('createdAt', sql.DateTime2, task.createdAt)
      .input('dueDate', sql.DateTime2, task.dueDate)
      .input('estimatedMinutes', sql.Int, task.estimatedMinutes)
      .input('notes', sql.NVarChar, task.notes ?? '')
      .input('archived', sql.Bit, task.archived)
      .input('recurrent', sql.Bit, task.recurrent)
      .input('recurDays', sql.NVarChar, task.recurDays.join(','))
      .input('recurPaused', sql.Bit, task.recurPaused)
      .input('completedAt', sql.DateTime2, task.completedAt ?? null)
      .input('spentSeconds', sql.Int, task.totalSpentSeconds)
  }

  async findById(id: number): Promise<Task | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT * FROM Task WHERE id = @id`)
    if (!result.recordset[0]) return null
    return this.deserialize(result.recordset[0])
  }

  async findByWeek(start: Date, end: Date, category?: string): Promise<Task[]> {
    const pool = await getPool()
    const req = pool.request()
      .input('start', sql.DateTime2, start)
      .input('end', sql.DateTime2, end)
    const catClause = category ? `AND category = @category` : ''
    if (category) req.input('category', sql.NVarChar, category)
    const result = await req.query(`
      SELECT * FROM Task
      WHERE archived = 0
        AND createdAt >= @start AND createdAt <= @end
        ${catClause}
    `)
    return result.recordset.map(r => this.deserialize(r))
  }

  async findCarriedOver(weekStart: Date, category?: string): Promise<Task[]> {
    const pool = await getPool()
    const req = pool.request()
      .input('weekStart', sql.DateTime2, weekStart)
    const catClause = category ? `AND category = @category` : ''
    if (category) req.input('category', sql.NVarChar, category)
    const result = await req.query(`
      SELECT * FROM Task
      WHERE archived = 0
        AND status != 'concluída'
        AND createdAt < @weekStart
        ${catClause}
    `)
    return result.recordset.map(r => this.deserialize(r))
  }

  async findToday(): Promise<Task[]> {
    const pool = await getPool()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const result = await pool.request()
      .input('today', sql.DateTime2, today)
      .input('tomorrow', sql.DateTime2, tomorrow)
      .query(`
        SELECT * FROM Task
        WHERE archived = 0
          AND status != 'concluída'
          AND (
            (createdAt >= @today AND createdAt < @tomorrow)
            OR (dueDate >= @today AND dueDate < @tomorrow)
          )
      `)
    return result.recordset.map(r => this.deserialize(r))
  }

  async findOverdue(): Promise<Task[]> {
    const pool = await getPool()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const result = await pool.request()
      .input('today', sql.DateTime2, today)
      .query(`
        SELECT * FROM Task
        WHERE archived = 0
          AND status != 'concluída'
          AND status != 'arquivada'
          AND dueDate < @today
      `)
    return result.recordset.map(r => this.deserialize(r))
  }

  async findArchived(): Promise<Task[]> {
    const pool = await getPool()
    const result = await pool.request()
      .query(`SELECT * FROM Task WHERE archived = 1`)
    return result.recordset.map(r => this.deserialize(r))
  }

  async save(task: Task): Promise<void> {
    const pool = await getPool()
    const existing = await this.findById(task.id)

    if (existing) {
      const req = pool.request().input('id', sql.Int, task.id)
      await this.serialize(task, req)
      await req.query(`
        UPDATE Task SET
          name = @name, category = @category, priority = @priority,
          status = @status, dueDate = @dueDate, estimatedMinutes = @estimatedMinutes,
          notes = @notes, archived = @archived, recurrent = @recurrent,
          recurDays = @recurDays, recurPaused = @recurPaused,
          completedAt = @completedAt, spentSeconds = @spentSeconds
        WHERE id = @id
      `)
    } else {
      const req = pool.request().input('id', sql.Int, task.id)
      await this.serialize(task, req)
      await req.query(`
        INSERT INTO Task (name, category, priority, status, createdAt, dueDate,
            estimatedMinutes, notes, archived, recurrent, recurDays, recurPaused,
            completedAt, spentSeconds)
        VALUES (@name, @category, @priority, @status, @createdAt, @dueDate,
            @estimatedMinutes, @notes, @archived, @recurrent, @recurDays, @recurPaused,
            @completedAt, @spentSeconds)
        `)
    }
  }

  async delete(id: number): Promise<void> {
    const pool = await getPool()
    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM Task WHERE id = @id`)
  }
}