import {Utils} from './Utils';

export class Color {
  private static MIN_COMPONENT_VALUE = 0.0;
  private static MAX_COMPONENT_VALUE = 1.0;

  public r: number;
  public g: number;
  public b: number;
  public a: number;

  constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 0) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  private static clamp(componentValue: number): number {
    if (componentValue > Color.MAX_COMPONENT_VALUE) {
      return Color.MAX_COMPONENT_VALUE;
    } else if (componentValue < Color.MIN_COMPONENT_VALUE) {
      return Color.MIN_COMPONENT_VALUE;
    } else {
      return componentValue;
    }
  }

  public set(source: Color): void {
    this.r = Color.clamp(source.r);
    this.g = Color.clamp(source.g);
    this.b = Color.clamp(source.b);
    this.a = Color.clamp(source.a);
  }

  public addRGB(r: number, g: number, b: number): Color {
    this.r = Color.clamp(this.r + r);
    this.g = Color.clamp(this.g + g);
    this.b = Color.clamp(this.b + b);
    return this;
  }

  public subtractRGB(r: number, g: number, b: number): Color {
    this.r = Color.clamp(this.r - r);
    this.g = Color.clamp(this.g - g);
    this.b = Color.clamp(this.b - b);
    return this;
  }

  public lighten(amount: number): Color {
    return this.addRGB(amount, amount, amount);
  }

  public darken(amount: number): Color {
    return this.subtractRGB(amount, amount, amount);
  }

  public toArray(): number[] {
    return [this.r, this.g, this.b, this.a];
  }

  public toString(): string {
    return `Red: ${this.r}, Green: ${this.g}, Blue: ${this.b}, Alpha: ${this.a}`;
  }

  public static randomOpaqueColour(): Color {
    return new Color(
      Utils.randomNextFloat(),
      Utils.randomNextFloat(),
      Utils.randomNextFloat(),
      1.0
    );
  }

  public equals(obj: Object): boolean {
    if (this == obj) {
      return true;
    }
    if (obj == null) {
      return false;
    }

    const other = obj as Color;

    if (this.r !== other.r) {
      return false;
    }

    if (this.g !== other.g) {
      return false;
    }

    if (this.b !== other.b) {
      return false;
    }

    if (this.a !== other.a) {
      return false;
    }

    return true;
  }
}
