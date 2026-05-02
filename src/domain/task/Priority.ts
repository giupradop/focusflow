import { ValueObject } from '../shared/ValueObject'

type PriorityLevel = 'alta' | 'média' | 'baixa'

type PriorityProps = {
  value: PriorityLevel
}

export class Priority extends ValueObject<PriorityProps> {

  private constructor(props: PriorityProps) {
    super(props)
  }

  static create(value: string): Priority {
    if (!['alta', 'média', 'baixa'].includes(value)) {
      throw new Error(`Prioridade inválida: ${value}`)
    }
    return new Priority({ value: value as PriorityLevel })
  }

  get sortOrder(): number {
    const order = { alta: 0, média: 1, baixa: 2 }
    return order[this.props.value]
  }

  toString(): string {
    return this.props.value
  }
}
