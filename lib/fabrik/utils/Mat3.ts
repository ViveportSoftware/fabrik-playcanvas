import {Utils} from './Utils';
import {Vec3} from './Vec3';

export class Mat3 {
  private static DEGS_TO_RADS = Math.PI / 180.0;
  private static RADS_TO_DEGS = 180.0 / Math.PI;

  // First  column - typically the direction of the positive X-axis
  public m00: number;
  public m01: number;
  public m02: number;

  // Second column - typically the direction of the positive Y-axis
  public m10: number;
  public m11: number;
  public m12: number;

  // Third  column - typically the direction of the positive Z-axis
  public m20: number;
  public m21: number;
  public m22: number;

  public constructor(
    m00: number = 0,
    m01: number = 0,
    m02: number = 0,
    m10: number = 0,
    m11: number = 0,
    m12: number = 0,
    m20: number = 0,
    m21: number = 0,
    m22: number = 0
  ) {
    this.m00 = m00;
    this.m01 = m01;
    this.m02 = m02;

    this.m10 = m10;
    this.m11 = m11;
    this.m12 = m12;

    this.m20 = m20;
    this.m21 = m21;
    this.m22 = m22;
  }

  /** Zero all elements of this matrix. */
  public zero(): void {
    this.m00 =
      this.m01 =
      this.m02 =
      this.m10 =
      this.m11 =
      this.m12 =
      this.m20 =
      this.m21 =
      this.m22 =
        0.0;
  }

  /** Reset this matrix to identity. */
  public setIdentity(): void {
    // Set diagonal and then zero the rest of the matrix
    this.m00 = this.m11 = this.m22 = 1.0;
    this.m01 = this.m02 = this.m10 = this.m12 = this.m20 = this.m21 = 0.0;
  }

  /**
   * Return a new matrix which is the transposed version of the provided matrix.
   *
   * @param	m	The matrix which we will transpose (this matrix is not modified)
   * @return		A transposed version of the provided matrix.
   */
  public static transpose(m: Mat3): Mat3 {
    return new Mat3(
      m.m00,
      m.m10,
      m.m20,
      m.m01,
      m.m11,
      m.m21,
      m.m02,
      m.m12,
      m.m22
    );
  }

  /**
   * Create a rotation matrix from a given direction.
   * <p>
   * The reference direction is aligned to the Z-Axis. Note: The singularity is on the positive Y-Axis.
   * <p>
   * This method uses the <a href="https://gist.github.com/roxlu/3082114">Frisvad technique</a> for generating perpendicular axes.
   *
   * @param	referenceDirection	The vector to use as the Z-Axis
   * @return	The created rotation matrix.
   *
   * @see Vec3f#genPerpendicularVectorQuick(Vec3f)
   */
  public static createRotationMatrix(referenceDirection: Vec3): Mat3 {
    const rotMat = new Mat3();

    // Singularity fix provided by meaten - see: https://github.com/FedUni/caliko/issues/19
    if (Math.abs(referenceDirection.y) > 0.9999) {
      rotMat.setZBasis(referenceDirection);
      rotMat.setXBasis(new Vec3(1.0, 0.0, 0.0));
      rotMat.setYBasis(
        Vec3.crossProduct(rotMat.getXBasis(), rotMat.getZBasis()).normalised()
      );
    } else {
      rotMat.setZBasis(referenceDirection);
      rotMat.setXBasis(
        Vec3.crossProduct(
          referenceDirection,
          new Vec3(0.0, 1.0, 0.0)
        ).normalised()
      );
      rotMat.setYBasis(
        Vec3.crossProduct(rotMat.getXBasis(), rotMat.getZBasis()).normalised()
      );
    }

    return rotMat;
  }

  /**
   * Return whether this matrix consists of three orthogonal axes or not to within a cross-product of 0.01f.
   *
   * @return	Whether or not this matrix is orthogonal.
   */
  public isOrthogonal(): boolean {
    const xCrossYDot = Vec3.dotProduct(this.getXBasis(), this.getYBasis());
    const xCrossZDot = Vec3.dotProduct(this.getXBasis(), this.getZBasis());
    const yCrossZDot = Vec3.dotProduct(this.getYBasis(), this.getZBasis());

    if (
      Utils.approximatelyEquals(xCrossYDot, 0.0, 0.01) &&
      Utils.approximatelyEquals(xCrossZDot, 0.0, 0.01) &&
      Utils.approximatelyEquals(yCrossZDot, 0.0, 0.01)
    ) {
      return true;
    }

    // implied else...
    return false;
  }

  /**
   * Multiply this matrix by another matrix (in effect, combining them) and return the result as a new Mat3f.
   * <p>
   * Neither this matrix or the provided matrix argument are modified by this process - you must assign the result to your desired
   * combined matrix.
   * <p>
   * To create a ModelView matrix using this method you would use viewMatrix.times(modelMatrix).
   * To create a ModelViewProjection matrix using this method you would use projectionMatrix.times(viewMatrix).times(modelMatrix).
   *
   * @param	m	The matrix to multiply this matrix by.
   * @return		The resulting combined matrix.
   */
  public times(m: Mat3): Mat3 {
    const temp = new Mat3();

    temp.m00 = this.m00 * m.m00 + this.m10 * m.m01 + this.m20 * m.m02;
    temp.m01 = this.m01 * m.m00 + this.m11 * m.m01 + this.m21 * m.m02;
    temp.m02 = this.m02 * m.m00 + this.m12 * m.m01 + this.m22 * m.m02;

    temp.m10 = this.m00 * m.m10 + this.m10 * m.m11 + this.m20 * m.m12;
    temp.m11 = this.m01 * m.m10 + this.m11 * m.m11 + this.m21 * m.m12;
    temp.m12 = this.m02 * m.m10 + this.m12 * m.m11 + this.m22 * m.m12;

    temp.m20 = this.m00 * m.m20 + this.m10 * m.m21 + this.m20 * m.m22;
    temp.m21 = this.m01 * m.m20 + this.m11 * m.m21 + this.m21 * m.m22;
    temp.m22 = this.m02 * m.m20 + this.m12 * m.m21 + this.m22 * m.m22;

    return temp;
  }

  /**
   * Multiply a vector by this matrix and return the result as a new Vec3f.
   *
   * @param	source	The source vector to transform.
   * @return		The provided source vector transformed by this matrix.
   */
  public timesByVec3(source: Vec3): Vec3 {
    return new Vec3(
      this.m00 * source.x + this.m10 * source.y + this.m20 * source.z,
      this.m01 * source.x + this.m11 * source.y + this.m21 * source.z,
      this.m02 * source.x + this.m12 * source.y + this.m22 * source.z
    );
  }

  /**
   * Calculate and return the determinant of this matrix.
   *
   * @return	The determinant of this matrix.
   */
  public determinant(): number {
    return (
      this.m20 * this.m01 * this.m12 -
      this.m20 * this.m02 * this.m11 -
      this.m10 * this.m01 * this.m22 +
      this.m10 * this.m02 * this.m21 +
      this.m00 * this.m11 * this.m22 -
      this.m00 * this.m12 * this.m21
    );
  }

  /**
   * Return a matrix which is the inverse of the provided matrix.
   *
   * @param	m	The matrix to invert.
   * @return		The inverse matrix of of the provided matrix argument.
   */
  public static inverse(m: Mat3): Mat3 {
    const d = m.determinant();

    const temp = new Mat3();

    temp.m00 = (m.m11 * m.m22 - m.m12 * m.m21) / d;
    temp.m01 = -(m.m01 * m.m22 - m.m02 * m.m21) / d;
    temp.m02 = (m.m01 * m.m12 - m.m02 * m.m11) / d;
    temp.m10 = -(-m.m20 * m.m12 + m.m10 * m.m22) / d;
    temp.m11 = (-m.m20 * m.m02 + m.m00 * m.m22) / d;
    temp.m12 = -(-m.m10 * m.m02 + m.m00 * m.m12) / d;
    temp.m20 = (-m.m20 * m.m11 + m.m10 * m.m21) / d;
    temp.m21 = -(-m.m20 * m.m01 + m.m00 * m.m21) / d;
    temp.m22 = (-m.m10 * m.m02 + m.m00 * m.m11) / d;

    return temp;
  }

  /**
   *  Rotate this matrix by the provided angle about the specified axis.
   *
   *  @param	angleRads		The angle to rotate the matrix, specified in radians.
   *  @param	rotationAxis	The axis to rotate this matrix about, relative to the current configuration of this matrix.
   *  @return					The rotated version of this matrix.
   */
  public rotateRads(rotationAxis: Vec3, angleRads: number): Mat3 {
    // Note: we need this temporary matrix because we cannot perform this operation 'in-place'.
    const dest = new Mat3();

    const sin = Math.sin(angleRads);
    const cos = Math.cos(angleRads);
    const oneMinusCos = 1.0 - cos;

    const xy = rotationAxis.x * rotationAxis.y;
    const yz = rotationAxis.y * rotationAxis.z;
    const xz = rotationAxis.x * rotationAxis.z;
    const xs = rotationAxis.x * sin;
    const ys = rotationAxis.y * sin;
    const zs = rotationAxis.z * sin;

    const f00 = rotationAxis.x * rotationAxis.x * oneMinusCos + cos;
    const f01 = xy * oneMinusCos + zs;
    const f02 = xz * oneMinusCos - ys;

    const f10 = xy * oneMinusCos - zs;
    const f11 = rotationAxis.y * rotationAxis.y * oneMinusCos + cos;
    const f12 = yz * oneMinusCos + xs;

    const f20 = xz * oneMinusCos + ys;
    const f21 = yz * oneMinusCos - xs;
    const f22 = rotationAxis.z * rotationAxis.z * oneMinusCos + cos;

    const t00 = this.m00 * f00 + this.m10 * f01 + this.m20 * f02;
    const t01 = this.m01 * f00 + this.m11 * f01 + this.m21 * f02;
    const t02 = this.m02 * f00 + this.m12 * f01 + this.m22 * f02;

    const t10 = this.m00 * f10 + this.m10 * f11 + this.m20 * f12;
    const t11 = this.m01 * f10 + this.m11 * f11 + this.m21 * f12;
    const t12 = this.m02 * f10 + this.m12 * f11 + this.m22 * f12;

    // Construct and return rotation matrix
    dest.m20 = this.m00 * f20 + this.m10 * f21 + this.m20 * f22;
    dest.m21 = this.m01 * f20 + this.m11 * f21 + this.m21 * f22;
    dest.m22 = this.m02 * f20 + this.m12 * f21 + this.m22 * f22;

    dest.m00 = t00;
    dest.m01 = t01;
    dest.m02 = t02;

    dest.m10 = t10;
    dest.m11 = t11;
    dest.m12 = t12;

    return dest;
  }

  /**
   *  Rotate this matrix by the provided angle about the specified axis.
   *
   *  @param	angleDegs	The angle to rotate the matrix, specified in degrees.
   *  @param	localAxis	The axis to rotate this matrix about, relative to the current configuration of this matrix.
   *  @return			The rotated version of this matrix.
   *  */
  public rotateDegs(angleDegs: number, localAxis: Vec3): Mat3 {
    return this.rotateRads(localAxis, angleDegs * Mat3.DEGS_TO_RADS);
  }

  /**
   * Set the X basis of this matrix.
   *
   * @param	v	The vector to use as the X-basis of this matrix.
   */
  public setXBasis(v: Vec3): void {
    this.m00 = v.x;
    this.m01 = v.y;
    this.m02 = v.z;
  }

  /**
   * Get the X basis of this matrix.
   *
   * @return The X basis of this matrix as a Vec3f
   **/
  public getXBasis(): Vec3 {
    return new Vec3(this.m00, this.m01, this.m02);
  }

  /**
   * Set the Y basis of this matrix.
   *
   * @param	v	The vector to use as the Y-basis of this matrix.
   */
  public setYBasis(v: Vec3): void {
    this.m10 = v.x;
    this.m11 = v.y;
    this.m12 = v.z;
  }

  /**
   * Get the Y basis of this matrix.
   *
   * @return The Y basis of this matrix as a Vec3f
   **/
  public getYBasis(): Vec3 {
    return new Vec3(this.m10, this.m11, this.m12);
  }

  /**
   * Set the Z basis of this matrix.
   *
   * @param	v	The vector to use as the Z-basis of this matrix.
   */
  public setZBasis(v: Vec3): void {
    this.m20 = v.x;
    this.m21 = v.y;
    this.m22 = v.z;
  }

  /**
   * Get the Z basis of this matrix.
   *
   * @return The Z basis of this matrix as a Vec3f
   **/
  public getZBasis(): Vec3 {
    return new Vec3(this.m20, this.m21, this.m22);
  }

  /**
   * Return this Mat3f as an array of 9 floats.
   *
   * @return	This Mat3f as an array of 9 floats.
   */
  public toArray(): number[] {
    return [
      this.m00,
      this.m01,
      this.m02,
      this.m10,
      this.m11,
      this.m12,
      this.m20,
      this.m21,
      this.m22,
    ];
  }

  public toString(): string {
    return (
      `X Axis: ${this.m00},\t ${this.m01},\t ${this.m02}\r\n` +
      `Y Axis: ${this.m10},\t ${this.m11},\t ${this.m12}\r\n` +
      `Z Axis: ${this.m20},\t ${this.m21},\t ${this.m22}`
    );
  }
}
