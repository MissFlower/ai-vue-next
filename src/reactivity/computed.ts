import { ReactiveEffect } from './effect'

class ComputedRefImpl {
  private _value: any
  private _dirty: boolean = true
  public readonly effect: ReactiveEffect
  constructor(getter) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }

  get value() {
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }
}
export function computed(getter) {
  return new ComputedRefImpl(getter)
}
