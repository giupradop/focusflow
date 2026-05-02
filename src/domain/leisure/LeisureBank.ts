import { Entity } from '../shared/Entity'
import { LeisureBalance } from './LeisureBalance'
import { LeisureSession } from './LeisureSession'

interface LeisureBankProps {
  balance: LeisureBalance
  sessions: LeisureSession[]
}

export class LeisureBank extends Entity<number> {
  private props: LeisureBankProps

  private constructor(id: number, props: LeisureBankProps) {
    super(id)
    this.props = props
  }

  static create(id: number): LeisureBank {
    return new LeisureBank(id, {
      balance: LeisureBalance.zero(),
      sessions: [],
    })
  }

  deposit(minutes: number): void {
    this.props.balance = this.props.balance.add(minutes)
  }

  withdraw(session: LeisureSession): void {
    if (!session.isCompleted) {
      throw new Error('Sessão de lazer ainda não foi concluída')
    }
    this.props.balance = this.props.balance.subtract(session.usedMinutes)
    this.props.sessions.push(session)
  }

  canAfford(costMinutes: number): boolean {
    return this.props.balance.minutes >= costMinutes
  }

  get balance() { return this.props.balance }
  get sessions() { return this.props.sessions }

  get totalDepositedMinutes(): number {
    return this.props.sessions.reduce((acc, s) => acc + s.usedMinutes, 0)
  }
}