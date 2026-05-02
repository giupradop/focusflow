import { Entity } from '../shared/Entity'
import { Priority } from './Priority'
import { TaskStatus } from './TaskStatus'
import { Category } from './Category'
import { Session } from './Session'

interface TaskProps {
  name: string
  category: Category
  priority: Priority
  status: TaskStatus
  createdAt: Date
  dueDate: Date
  estimatedMinutes: number
  notes: string
  archived: boolean
  recurrent: boolean
  recurDays: number[]
  recurPaused: boolean
  sessions: Session[]
  completedAt?: Date
}

export class Task extends Entity<number> {
  private props: TaskProps

  private constructor(id: number, props: TaskProps) {
    super(id)
    this.props = props
  }

  static create(id: number, props: Omit<TaskProps, 'status' | 'archived' | 'sessions' | 'completedAt'>): Task {
    return new Task(id, {
      ...props,
      status: TaskStatus.PENDING,
      archived: false,
      sessions: [],
    })
  }

  // ── regras de negócio ──

  get isOverdue(): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return (
      this.props.dueDate < today &&
      this.props.status !== TaskStatus.DONE &&
      this.props.status !== TaskStatus.ARCHIVED
    )
  }

  isCarriedOver(weekStart: Date): boolean {
    const createdAt = new Date(this.props.createdAt)
    createdAt.setHours(0, 0, 0, 0)
    return (
      createdAt < weekStart &&
      this.props.status !== TaskStatus.DONE &&
      !this.props.archived
    )
  }

  isVisibleInWeek(weekStart: Date, weekEnd: Date): boolean {
    const createdAt = new Date(this.props.createdAt)
    createdAt.setHours(0, 0, 0, 0)

    const inCreationWeek = createdAt >= weekStart && createdAt <= weekEnd

    const carriedToCurrentWeek = this.isCarriedOver(weekStart)

    const completedThisWeek =
      this.props.completedAt !== undefined &&
      this.props.completedAt >= weekStart &&
      this.props.completedAt <= weekEnd

    return inCreationWeek || carriedToCurrentWeek || completedThisWeek
  }

  // ── ações ──

  startSession(sessionId: number): Session {
    if (this.props.status === TaskStatus.DONE) {
      throw new Error('Não é possível iniciar sessão em tarefa concluída')
    }
    if (this.props.archived) {
      throw new Error('Não é possível iniciar sessão em tarefa arquivada')
    }
    this.props.status = TaskStatus.IN_PROGRESS
    return Session.create(sessionId, this._id)
  }

  completeSession(session: Session): void {
    session.complete()
    this.props.sessions.push(session)
    this.props.status = TaskStatus.DONE
    this.props.completedAt = new Date()
  }

  saveSession(session: Session): void {
    session.complete()
    this.props.sessions.push(session)
    this.props.status = TaskStatus.IN_PROGRESS
  }

  archive(): void {
    if (this.props.status === TaskStatus.IN_PROGRESS) {
      throw new Error('Não é possível arquivar tarefa em andamento')
    }
    this.props.archived = true
    this.props.status = TaskStatus.ARCHIVED
  }

  restore(): void {
    this.props.archived = false
    this.props.status = TaskStatus.PENDING
  }

  updateNotes(notes: string): void {
    this.props.notes = notes
  }

  pauseRecurrence(): void {
    this.props.recurPaused = true
  }

  resumeRecurrence(): void {
    this.props.recurPaused = false
  }

  // ── getters ──

  get name() { return this.props.name }
  get category() { return this.props.category }
  get priority() { return this.props.priority }
  get status() { return this.props.status }
  get createdAt() { return this.props.createdAt }
  get dueDate() { return this.props.dueDate }
  get estimatedMinutes() { return this.props.estimatedMinutes }
  get notes() { return this.props.notes }
  get archived() { return this.props.archived }
  get recurrent() { return this.props.recurrent }
  get recurDays() { return this.props.recurDays }
  get recurPaused() { return this.props.recurPaused }
  get sessions() { return this.props.sessions }
  get completedAt() { return this.props.completedAt }
  get totalSpentSeconds(): number {
    return this.props.sessions.reduce((acc, s) => acc + s.durationSeconds, 0)
  }
  get remainingSeconds(): number {
    return this.props.estimatedMinutes * 60 - this.totalSpentSeconds
  }
}