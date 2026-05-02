import { Entity } from '../shared/Entity'

interface LeisureSessionProps {
  activityId: number
  activityCostMinutes: number
  startedAt: Date
  endedAt?: Date
  usedSeconds: number
}

export class LeisureSession extends Entity<number> {
  private props: LeisureSessionProps

  private constructor(id: number, props: LeisureSessionProps) {
    super(id)
    this.props = props
  }

  static create(id: number, activityId: number, activityCostMinutes: number): LeisureSession {
    return new LeisureSession(id, {
      activityId,
      activityCostMinutes,
      startedAt: new Date(),
      usedSeconds: 0,
    })
  }

  tick(): void {
    const maxSeconds = this.props.activityCostMinutes * 60
    if (this.props.usedSeconds < maxSeconds) {
      this.props.usedSeconds++
    }

    if (this.props.usedSeconds >= maxSeconds) {
      this.complete()
    }
  }

  complete(): void {
    if (!this.props.endedAt) {
      this.props.endedAt = new Date()
    }
  }

  get isCompleted(): boolean {
    return this.props.endedAt !== undefined
  }

  get remainingSeconds(): number {
    return this.props.activityCostMinutes * 60 - this.props.usedSeconds
  }

  get usedMinutes(): number {
    return Math.ceil(this.props.usedSeconds / 60)
  }

  get activityId() { return this.props.activityId }
  get activityCostMinutes() { return this.props.activityCostMinutes }
  get startedAt() { return this.props.startedAt }
  get endedAt() { return this.props.endedAt }
  get usedSeconds() { return this.props.usedSeconds }
}