import { Session } from '../task/Session'
import { LeisureBank } from './LeisureBank'

export class LeisureDomainService {

  calculateEarned(session: Session, ratio: number): number {
    if (ratio <= 0) {
      throw new Error('Ratio deve ser maior que zero')
    }
    return Math.ceil(session.durationSeconds / 60 / ratio)
  }

  depositEarned(session: Session, bank: LeisureBank, ratio: number): void {
    const earned = this.calculateEarned(session, ratio)
    bank.deposit(earned)
  }
}