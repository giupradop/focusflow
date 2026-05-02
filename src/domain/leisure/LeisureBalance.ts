import { ValueObject } from '../shared/ValueObject'

type LeisureBalanceProps = {
  minutes: number
}

export class LeisureBalance extends ValueObject<LeisureBalanceProps> {

  private constructor(props: LeisureBalanceProps) {
    super(props)
  }

  static create(minutes: number): LeisureBalance {
    if (minutes < 0) {
      throw new Error('Saldo de lazer não pode ser negativo')
    }
    return new LeisureBalance({ minutes })
  }

  static zero(): LeisureBalance {
    return new LeisureBalance({ minutes: 0 })
  }

  add(minutes: number): LeisureBalance {
    return new LeisureBalance({ minutes: this.props.minutes + minutes })
  }

  subtract(minutes: number): LeisureBalance {
    if (this.props.minutes - minutes < 0) {
      throw new Error('Saldo insuficiente')
    }
    return new LeisureBalance({ minutes: this.props.minutes - minutes })
  }

  get minutes(): number {
    return this.props.minutes
  }

  get hasBalance(): boolean {
    return this.props.minutes > 0
  }
}