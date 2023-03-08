import {Vector} from './Vector';

export class Vec2 implements Vector<Vec2> {
  private static DEGS_TO_RADS = Math.PI / 180.0;
  private static RADS_TO_DEGS = 180.0 / Math.PI;

  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public approximatelyEquals(v: Vec2, tolerance: number): boolean {
    if (tolerance < 0) {
      throw new Error('Method not implemented.');
    }
    return (
      Math.abs(this.x - v.x) < tolerance && Math.abs(this.y - v.y) < tolerance
    );
  }

  public plus(v: Vec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  public minus(v: Vec2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  public times(value: number): Vec2 {
    return new Vec2(this.x * value, this.y * value);
  }

  public dividedBy(value: number): Vec2 {
    return new Vec2(this.x / value, this.y / value);
  }

  public negated(): Vec2 {
    return new Vec2(-this.x, -this.y);
  }

  public set(source: Vec2): void {
    this.x = source.x;
    this.y = source.y;
  }

  public length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public normalise(): Vec2 {
    const magnitude = Math.sqrt(this.x * this.x + this.y * this.y);

    if (magnitude > 0) {
      this.x /= magnitude;
      this.y /= magnitude;
    }

    return this;
  }
}
