import { Entity } from '../shared/Entity'

interface LeisureActivityProps {
  name: string
  costMinutes: number
}

export class LeisureActivity extends Entity<number> {
  private props: LeisureActivityProps

  private constructor(id: number, props: LeisureActivityProps) {
    super(id)
    this.props = props
  }

  static create(id: number, name: string, costMinutes: number): LeisureActivity {
    if (costMinutes <= 0) {
      throw new Error('Custo da atividade deve ser maior que zero')
    }
    return new LeisureActivity(id, { name, costMinutes })
  }

  update(name: string, costMinutes: number): void {
    if (costMinutes <= 0) {
      throw new Error('Custo da atividade deve ser maior que zero')
    }
    this.props.name = name
    this.props.costMinutes = costMinutes
  }

  get name() { return this.props.name }
  get costMinutes() { return this.props.costMinutes }
}