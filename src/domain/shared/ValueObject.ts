export abstract class ValueObject<T> {
  protected readonly props: T

  constructor(props: T) {
    this.props = props
  }

  equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props)
  }
}