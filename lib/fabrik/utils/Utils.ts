import {Vec3} from './Vec3';

export class Utils {
  private static DEGS_TO_RADS = Math.PI / 180.0;
  private static RADS_TO_DEGS = 180.0 / Math.PI;

  public static MAX_NAME_LENGTH = 100;

  public static randomNextFloat(): number {
    return Math.random();
  }

  public static randomNextInt(i: number): number {
    return Math.floor(Math.random() * i);
  }

  public static randRangeFloat(min: number, max: number): number {
    return Utils.randomNextFloat() * (max - min) + min;
  }

  public static randRangeInt(min: number, max: number): number {
    return Utils.randomNextInt(max - min) + min;
  }

  public static approximatelyEquals(
    a: number,
    b: number,
    tolerance: number
  ): boolean {
    return Math.abs(a - b) <= tolerance ? true : false;
  }

  /**
   * Determine the sign of a float value.
   *
   * @param	value	The value to return the sign of.
   * @return			1.0f if the provided float value is positive, -1.0f otherwise.
   */
  public static sign(value: number): number {
    if (value >= 0.0) {
      return 1.0;
    }
    return -1.0;
  }

  /**
   * Return the given name capped at 100 characters, if necessary.
   *
   * @param	name	The name to validate.
   * @return			The given name capped at 100 characters, if necessary.
   */
  public static getValidatedName(name: string): string {
    if (name.length >= Utils.MAX_NAME_LENGTH) {
      return name.substring(0, Utils.MAX_NAME_LENGTH);
    } else {
      return name;
    }
  }

  /**
   * Validate a direction unit vector (Vec3f) to ensure that it does not have a magnitude of zero.
   * <p>
   * If the direction unit vector has a magnitude of zero then an IllegalArgumentException is thrown.
   * @param	directionUV	The direction unit vector to validate
   */
  public static validateDirectionUV(directionUV: Vec3): void {
    // Ensure that the magnitude of this direction unit vector is greater than zero
    if (directionUV.length() <= 0.0) {
      throw new Error('Vec3f direction unit vector cannot be zero.');
    }
  }

  /**
   * Validate the length of a bone to ensure that it's a positive value.
   * <p>
   * If the provided bone length is not greater than zero then an IllegalArgumentException is thrown.
   * @param	length	The length value to validate.
   */
  public static validateLength(length: number): void {
    // Ensure that the magnitude of this direction unit vector is not zero
    if (length < 0.0) {
      throw new Error('Length must be a greater than or equal to zero.');
    }
  }

  /** Ensure we have a legal line width with which to draw.
   * <p>
   * Valid line widths are between 1.0f and 32.0f pixels inclusive.
   * <p>
   * Line widths outside this range will cause an IllegalArgumentException to be thrown.
   *
   * @param	lineWidth	The width of the line we are validating.
   */
  public static validateLineWidth(lineWidth: number): void {
    if (lineWidth < 1.0 || lineWidth > 32.0) {
      throw new Error(
        'Line widths must be within the range 1.0f to 32.0f - but only 1.0f is guaranteed to be supported.'
      );
    }
  }
}
