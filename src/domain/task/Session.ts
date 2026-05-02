import { Entity } from '../shared/Entity'

interface SessionProps {
  taskId: number
  startedAt: Date
  endedAt?: Date
  durationSeconds: number
  pausedSeconds: number
}

export class Session extends Entity<number> {
  private props: SessionProps

  private constructor(id: number, props: SessionProps) {
    super(id)
    this.props = props
  }

  static create(id: number, taskId: number): Session {
    return new Session(id, {
      taskId,
      startedAt: new Date(),
      durationSeconds: 0,
      pausedSeconds: 0,
    })
  }

  tick(): void {
    this.props.durationSeconds++
  }

  pause(): void {
    this.props.pausedSeconds++
  }

  complete(): void {
    this.props.endedAt = new Date()
  }

  get taskId() { return this.props.taskId }
  get durationSeconds() { return this.props.durationSeconds }
  get pausedSeconds() { return this.props.pausedSeconds }
  get startedAt() { return this.props.startedAt }
  get endedAt() { return this.props.endedAt }

  get earnedLeisureMinutes(): number {
    return Math.ceil(this.props.durationSeconds / 60 / 5)
  }
}